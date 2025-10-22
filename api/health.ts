import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "TinyTracks API is running" 
  });
}

