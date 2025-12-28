-- =====================================================
-- Create user_session_data VIEW
-- =====================================================
-- This view provides efficient access to user session data
-- including roles and permissions for use in middleware
-- and authentication flows.
-- =====================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS user_session_data;

-- Create the user_session_data view
CREATE OR REPLACE VIEW user_session_data AS
SELECT
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone_number,
    u.sex,
    u.age_group,
    u.status,
    u.created_at,
    u.updated_at,

    -- Get the first role (assuming user has one primary role)
    (
        SELECT r.id
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id
        LIMIT 1
    ) AS role_id,

    (
        SELECT r.name
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id
        LIMIT 1
    ) AS role_name,

    -- Get all roles as array (for users with multiple roles)
    (
        SELECT COALESCE(array_agg(r.name), ARRAY[]::text[])
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = u.id
    ) AS roles,

    -- Get all permissions as array by joining through role_permissions
    (
        SELECT COALESCE(array_agg(DISTINCT p.name), ARRAY[]::text[])
        FROM user_roles ur
        JOIN role_permissions rp ON rp.role_id = ur.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = u.id
    ) AS permissions

FROM users u;

-- Create index on the underlying tables for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Add comment
COMMENT ON VIEW user_session_data IS
'Materialized view providing user session data with roles and permissions.
Used by authentication middleware to efficiently validate user permissions.';

-- Grant access to authenticated users
GRANT SELECT ON user_session_data TO authenticated;
GRANT SELECT ON user_session_data TO service_role;
