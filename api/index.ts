import express, { type Express, type Request, type Response } from "express";
import { registerRoutes } from "../server/routes";

let appPromise: Promise<Express> | null = null;

async function buildApp(): Promise<Express> {
  if (appPromise) return appPromise;
  appPromise = (async () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    await registerRoutes(app);
    return app;
  })();
  return appPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    const app = await buildApp();
    // Properly invoke Express app as middleware
    app(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}









