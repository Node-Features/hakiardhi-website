import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Migration {
  name: string;
  path: string;
  sql: string;
}

class MigrationRunner {
  private migrationsDir: string;

  constructor(migrationsDir: string) {
    this.migrationsDir = migrationsDir;
  }

  /**
   * Get all migration files
   */
  async getMigrations(): Promise<Migration[]> {
    const files = fs.readdirSync(this.migrationsDir);
    const sqlFiles = files
      .filter((file) => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    return sqlFiles.map((file) => ({
      name: file,
      path: path.join(this.migrationsDir, file),
      sql: fs.readFileSync(path.join(this.migrationsDir, file), 'utf-8'),
    }));
  }

  /**
   * Check if migrations table exists, create if not
   */
  async ensureMigrationsTable(): Promise<void> {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `,
    });

    if (error) {
      // Try alternative approach using direct SQL
      console.log('Creating migrations table...');
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      const { error: tableError } = await supabase
        .from('migrations')
        .select('*')
        .limit(1);

      if (tableError && tableError.message.includes('does not exist')) {
        console.log('⚠️  Please run this SQL manually in Supabase SQL Editor:');
        console.log(createTableSQL);
        console.log('\nThen run this script again.');
        process.exit(1);
      }
    }
  }

  /**
   * Get already executed migrations
   */
  async getExecutedMigrations(): Promise<string[]> {
    const { data, error } = await supabase
      .from('migrations')
      .select('name')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Error fetching executed migrations:', error.message);
      return [];
    }

    return data?.map((m) => m.name) || [];
  }

  /**
   * Execute a single migration
   */
  async executeMigration(migration: Migration): Promise<boolean> {
    console.log(`\n🔄 Running migration: ${migration.name}`);

    try {
      // Split SQL into individual statements
      const statements = migration.sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement,
          });

          if (error) {
            // If exec_sql doesn't work, log the statement for manual execution
            console.error(`❌ Error executing statement:`, error.message);
            console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
            console.log('---');
            console.log(migration.sql);
            console.log('---\n');
            return false;
          }
        }
      }

      // Record migration as executed
      const { error: recordError } = await supabase
        .from('migrations')
        .insert({ name: migration.name });

      if (recordError) {
        console.error(`❌ Error recording migration:`, recordError.message);
        return false;
      }

      console.log(`✅ Migration ${migration.name} completed successfully`);
      return true;
    } catch (error: any) {
      console.error(`❌ Migration ${migration.name} failed:`, error.message);
      return false;
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    console.log('🚀 Starting database migrations...\n');

    await this.ensureMigrationsTable();

    const allMigrations = await this.getMigrations();
    const executedMigrations = await this.getExecutedMigrations();

    const pendingMigrations = allMigrations.filter(
      (m) => !executedMigrations.includes(m.name)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations. Database is up to date.');
      return;
    }

    console.log(`📝 Found ${pendingMigrations.length} pending migration(s):\n`);
    pendingMigrations.forEach((m, i) => {
      console.log(`${i + 1}. ${m.name}`);
    });

    let successCount = 0;
    let failCount = 0;

    for (const migration of pendingMigrations) {
      const success = await this.executeMigration(migration);
      if (success) {
        successCount++;
      } else {
        failCount++;
        console.log('\n⚠️  Migration failed. Stopping execution.');
        break;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${pendingMigrations.length}`);

    if (failCount > 0) {
      console.log('\n❗ Some migrations failed. Please check the errors above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All migrations completed successfully!');
    }
  }

  /**
   * Show migration status
   */
  async showStatus(): Promise<void> {
    console.log('📊 Migration Status:\n');

    const allMigrations = await this.getMigrations();
    const executedMigrations = await this.getExecutedMigrations();

    console.log('Executed migrations:');
    if (executedMigrations.length === 0) {
      console.log('  (none)');
    } else {
      executedMigrations.forEach((m, i) => {
        console.log(`  ${i + 1}. ✅ ${m}`);
      });
    }

    const pendingMigrations = allMigrations.filter(
      (m) => !executedMigrations.includes(m.name)
    );

    console.log('\nPending migrations:');
    if (pendingMigrations.length === 0) {
      console.log('  (none)');
    } else {
      pendingMigrations.forEach((m, i) => {
        console.log(`  ${i + 1}. ⏳ ${m.name}`);
      });
    }

    console.log(`\nTotal: ${allMigrations.length} migrations`);
    console.log(`Executed: ${executedMigrations.length}`);
    console.log(`Pending: ${pendingMigrations.length}`);
  }
}

// Main execution
const command = process.argv[2];
const migrationsDir = path.join(__dirname, '../migrations');

const runner = new MigrationRunner(migrationsDir);

(async () => {
  try {
    if (command === 'status') {
      await runner.showStatus();
    } else {
      await runner.runMigrations();
    }
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
})();
