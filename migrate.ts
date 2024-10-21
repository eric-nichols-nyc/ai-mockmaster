import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function main() {
  const sql = neon(process.env.NEON_DB_URL!);
  const db = drizzle(sql);

  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './src/db/drizzle' });
  
  console.log('Migrations complete.');
}

main().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
