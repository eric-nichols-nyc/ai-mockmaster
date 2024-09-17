import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Ensure this file is only used in a server-side context
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}
console.log('test ',process.env.NEON_DB_URL!)
const client = postgres(process.env.NEON_DB_URL!);
export const db = drizzle(client);