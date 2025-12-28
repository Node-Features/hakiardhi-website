/**
 * RBAC Configuration
 *
 * Control whether Role-Based Access Control is enabled or disabled
 */

// ========================================
// RBAC CONFIGURATION
// ========================================
// Set to 'true' to enable RBAC permission checks
// Set to 'false' to disable RBAC (show all UI elements to all users)
export const RBAC_ENABLED = false; // ⚠️ RBAC DISABLED
// ========================================

/**
 * How to Re-enable RBAC:
 *
 * 1. Set RBAC_ENABLED = true in this file
 * 2. Set RBAC_ENABLED = true in Backend/v1/src/middleware.ts
 * 3. Ensure database permissions are created
 * 4. Assign permissions to roles
 * 5. Test with users having different permission sets
 */
