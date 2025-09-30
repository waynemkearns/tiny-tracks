import express, { type Express, type Request, type Response } from "express";
import { registerRoutes } from "../server/routes";

let appPromise: Promise<Express> | null = null;

function buildApp(): Promise<Express> {
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
  const app = await buildApp();
  return (app as any)(req, res);
}




