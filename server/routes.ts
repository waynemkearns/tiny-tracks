import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBabySchema, insertFeedSchema, insertNappySchema, insertSleepSessionSchema,
  insertHealthRecordSchema, insertGrowthRecordSchema, insertVaccinationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Baby routes
  app.get("/api/babies", async (req, res) => {
    try {
      const babies = await storage.getBabies();
      res.json(babies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch babies" });
    }
  });

  app.get("/api/babies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const baby = await storage.getBaby(id);
      if (!baby) {
        return res.status(404).json({ message: "Baby not found" });
      }
      res.json(baby);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch baby" });
    }
  });

  app.post("/api/babies", async (req, res) => {
    try {
      const babyData = insertBabySchema.parse(req.body);
      const baby = await storage.createBaby(babyData);
      res.status(201).json(baby);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid baby data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create baby" });
    }
  });

  app.put("/api/babies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const babyData = insertBabySchema.partial().parse(req.body);
      const baby = await storage.updateBaby(id, babyData);
      if (!baby) {
        return res.status(404).json({ message: "Baby not found" });
      }
      res.json(baby);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid baby data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update baby" });
    }
  });

  // Feed routes
  app.get("/api/babies/:babyId/feeds", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const feeds = await storage.getFeeds(babyId, limit);
      res.json(feeds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feeds" });
    }
  });

  app.post("/api/babies/:babyId/feeds", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const feedData = insertFeedSchema.parse({ ...req.body, babyId });
      const feed = await storage.createFeed(feedData);
      res.status(201).json(feed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feed data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create feed" });
    }
  });

  app.put("/api/feeds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const feedData = insertFeedSchema.partial().parse(req.body);
      const feed = await storage.updateFeed(id, feedData);
      if (!feed) {
        return res.status(404).json({ message: "Feed not found" });
      }
      res.json(feed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feed data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update feed" });
    }
  });

  app.delete("/api/feeds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFeed(id);
      if (!success) {
        return res.status(404).json({ message: "Feed not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete feed" });
    }
  });

  // Nappy routes
  app.get("/api/babies/:babyId/nappies", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const nappies = await storage.getNappies(babyId, limit);
      res.json(nappies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nappies" });
    }
  });

  app.post("/api/babies/:babyId/nappies", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const nappyData = insertNappySchema.parse({ ...req.body, babyId });
      const nappy = await storage.createNappy(nappyData);
      res.status(201).json(nappy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid nappy data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create nappy" });
    }
  });

  app.put("/api/nappies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const nappyData = insertNappySchema.partial().parse(req.body);
      const nappy = await storage.updateNappy(id, nappyData);
      if (!nappy) {
        return res.status(404).json({ message: "Nappy not found" });
      }
      res.json(nappy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid nappy data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update nappy" });
    }
  });

  app.delete("/api/nappies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNappy(id);
      if (!success) {
        return res.status(404).json({ message: "Nappy not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete nappy" });
    }
  });

  // Sleep routes
  app.get("/api/babies/:babyId/sleep", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sleepSessions = await storage.getSleepSessions(babyId, limit);
      res.json(sleepSessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sleep sessions" });
    }
  });

  app.get("/api/babies/:babyId/sleep/active", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const activeSleep = await storage.getActiveSleepSession(babyId);
      res.json(activeSleep || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active sleep session" });
    }
  });

  app.post("/api/babies/:babyId/sleep", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const sleepData = insertSleepSessionSchema.parse({ ...req.body, babyId });
      const sleepSession = await storage.createSleepSession(sleepData);
      res.status(201).json(sleepSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sleep data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sleep session" });
    }
  });

  app.put("/api/sleep/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sleepData = insertSleepSessionSchema.partial().parse(req.body);
      
      // Calculate duration if endTime is provided
      if (sleepData.endTime && sleepData.startTime) {
        const start = new Date(sleepData.startTime);
        const end = new Date(sleepData.endTime);
        sleepData.duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      }
      
      const sleepSession = await storage.updateSleepSession(id, sleepData);
      if (!sleepSession) {
        return res.status(404).json({ message: "Sleep session not found" });
      }
      res.json(sleepSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sleep data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sleep session" });
    }
  });

  app.delete("/api/sleep/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSleepSession(id);
      if (!success) {
        return res.status(404).json({ message: "Sleep session not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sleep session" });
    }
  });

  // Health routes
  app.get("/api/babies/:babyId/health", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const healthRecords = await storage.getHealthRecords(babyId, limit);
      res.json(healthRecords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch health records" });
    }
  });

  app.post("/api/babies/:babyId/health", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const healthData = insertHealthRecordSchema.parse({ ...req.body, babyId });
      const healthRecord = await storage.createHealthRecord(healthData);
      res.status(201).json(healthRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid health data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create health record" });
    }
  });

  app.put("/api/health/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const healthData = insertHealthRecordSchema.partial().parse(req.body);
      const healthRecord = await storage.updateHealthRecord(id, healthData);
      if (!healthRecord) {
        return res.status(404).json({ message: "Health record not found" });
      }
      res.json(healthRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid health data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update health record" });
    }
  });

  app.delete("/api/health/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHealthRecord(id);
      if (!success) {
        return res.status(404).json({ message: "Health record not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete health record" });
    }
  });

  // Growth routes
  app.get("/api/babies/:babyId/growth", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const growthRecords = await storage.getGrowthRecords(babyId);
      res.json(growthRecords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch growth records" });
    }
  });

  app.post("/api/babies/:babyId/growth", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const growthData = insertGrowthRecordSchema.parse({ ...req.body, babyId });
      const growthRecord = await storage.createGrowthRecord(growthData);
      res.status(201).json(growthRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid growth data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create growth record" });
    }
  });

  // Vaccination routes
  app.get("/api/babies/:babyId/vaccinations", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const vaccinations = await storage.getVaccinations(babyId);
      res.json(vaccinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vaccinations" });
    }
  });

  app.post("/api/babies/:babyId/vaccinations", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const vaccinationData = insertVaccinationSchema.parse({ ...req.body, babyId });
      const vaccination = await storage.createVaccination(vaccinationData);
      res.status(201).json(vaccination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vaccination data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create vaccination" });
    }
  });

  // Analytics routes
  app.get("/api/babies/:babyId/summary/:date", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const date = new Date(req.params.date);
      const summary = await storage.getDailySummary(babyId, date);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily summary" });
    }
  });

  app.get("/api/babies/:babyId/stats/weekly/:startDate", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const startDate = new Date(req.params.startDate);
      const stats = await storage.getWeeklyStats(babyId, startDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
