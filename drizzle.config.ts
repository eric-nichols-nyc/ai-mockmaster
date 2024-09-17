import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv';

config({ path: '.env.local' }); //
console.log('process.env.NEON_DB_URL',process.env.NEON_DB_URL)

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/drizzle",
  dbCredentials: {
    url: process.env.NEON_DB_URL!,
  },
})