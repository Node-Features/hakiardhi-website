#!/bin/bash

# Database Setup Script for Hakiardhi Digital Ecosystem
# This script runs database migrations for the Legal Aid system

echo "🚀 Hakiardhi Database Setup"
echo "=========================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with the following variables:"
    echo "  SUPABASE_URL=your_supabase_url"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Check if migrations directory exists
if [ ! -d "migrations" ]; then
    echo "❌ Error: migrations directory not found"
    exit 1
fi

echo "📁 Found migrations directory"
echo ""

# Option 1: Run migrations using Node.js script
if [ -f "scripts/run-migration.ts" ]; then
    echo "🔄 Running migrations using TypeScript runner..."
    npx ts-node scripts/run-migration.ts
    exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo ""
        echo "✅ Database setup completed successfully!"
    else
        echo ""
        echo "❌ Database setup failed. Please check the errors above."
        exit 1
    fi
else
    # Option 2: Direct SQL execution using psql (if available)
    echo "⚠️  TypeScript runner not found. Attempting direct SQL execution..."

    if command -v psql &> /dev/null; then
        # Extract connection details from Supabase URL
        # Format: https://[project-ref].supabase.co
        PROJECT_REF=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.supabase.co||')
        DB_HOST="${PROJECT_REF}.supabase.co"
        DB_NAME="postgres"
        DB_USER="postgres"

        echo "📡 Connecting to: $DB_HOST"
        echo ""

        # Prompt for password
        echo "Please enter your Supabase database password:"
        read -s DB_PASSWORD

        # Run each migration file
        for migration in migrations/*.sql; do
            echo "🔄 Running: $(basename $migration)"
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$migration"

            if [ $? -eq 0 ]; then
                echo "✅ $(basename $migration) completed"
            else
                echo "❌ $(basename $migration) failed"
                exit 1
            fi
        done

        echo ""
        echo "✅ All migrations completed successfully!"
    else
        echo "❌ psql command not found. Please run migrations manually:"
        echo ""
        echo "1. Go to your Supabase project dashboard"
        echo "2. Navigate to SQL Editor"
        echo "3. Copy and paste the contents of migrations/legal_aid_schema.sql"
        echo "4. Click 'Run' to execute the migration"
        exit 1
    fi
fi
