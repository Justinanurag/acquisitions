import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import logger from './logger.js';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);
// ✅ Connection check
(async () => {
  try {
    await sql`SELECT 1`;
    logger.info("✅ Database connected successfully (Neon)");
  } catch (error) {
    logger.error("❌ Database connection failed", error);
    process.exit(1);
  }
})();
export { db, sql };