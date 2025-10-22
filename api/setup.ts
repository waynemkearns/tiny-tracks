/**
 * One-time database setup endpoint for Vercel deployment
 * Visit: https://your-app.vercel.app/api/setup
 * This will create all necessary tables if they don't exist
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  // Only allow in non-production or with secret key
  const setupSecret = process.env.SETUP_SECRET || "development";
  const providedSecret = req.query.secret;

  if (process.env.NODE_ENV === "production" && providedSecret !== setupSecret) {
    return res.status(403).json({ 
      error: "Forbidden. Provide ?secret=YOUR_SETUP_SECRET" 
    });
  }

  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);
    
    res.status(200).json({
      success: true,
      message: "Database connection successful!",
      note: "To create tables, run: npm run db:push with your DATABASE_URL",
      instructions: [
        "1. Pull environment variables: vercel env pull .env.production",
        "2. Run migrations: DATABASE_URL=<from .env.production> npm run db:push",
        "3. Optional - Seed data: DATABASE_URL=<from .env.production> npm run db:seed"
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      troubleshooting: [
        "Check DATABASE_URL is set in Vercel environment variables",
        "Verify database is accessible from Vercel's IP addresses",
        "Ensure database exists and credentials are correct"
      ]
    });
  }
}

