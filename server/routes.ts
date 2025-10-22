import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBabySchema, insertFeedSchema, insertNappySchema, insertSleepSessionSchema,
  insertHealthRecordSchema, insertGrowthRecordSchema, insertVaccinationSchema, insertStandaloneNoteSchema,
  insertPregnancySchema, insertContractionSchema, insertFetalMovementSchema, insertMaternalHealthSchema,
  insertPregnancyAppointmentSchema, insertPreparationChecklistSchema
} from "./shared";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Minimal auth/session scaffold
  const PgSession = connectPg(session);
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session",
        createTableIfMissing: true,
      }) as any,
      secret: process.env.SESSION_SECRET || "dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
    }),
  );

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false);
        
        // Compare hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return done(null, false);
        
        return done(null, { id: user.id, username: user.username });
      } catch (err) {
        return done(err as Error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false);
      done(null, { id: user.id, username: user.username });
    } catch (err) {
      done(err as Error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: "username and password required" });
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "password must be at least 8 characters" });
    }
    
    try {
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(409).json({ message: "username taken" });
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });
      
      req.login({ id: user.id, username: user.username }, (err) => {
        if (err) return res.status(500).json({ message: "login failed" });
        res.json({ id: user.id, username: user.username });
      });
    } catch {
      res.status(500).json({ message: "registration failed" });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ id: (req.user as any).id, username: (req.user as any).username });
  });

  app.post("/api/auth/logout", (req, res, next) => {
    (req as any).logout((err: any) => {
      if (err) return next(err);
      res.status(204).send();
    });
  });
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

  // Standalone Notes routes
  app.get("/api/babies/:babyId/notes", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const notes = await storage.getStandaloneNotes(babyId, limit);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/babies/:babyId/notes", async (req, res) => {
    try {
      const babyId = parseInt(req.params.babyId);
      const noteData = insertStandaloneNoteSchema.parse({ ...req.body, babyId });
      const note = await storage.createStandaloneNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put("/api/babies/:babyId/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const noteData = insertStandaloneNoteSchema.partial().parse(req.body);
      const note = await storage.updateStandaloneNote(id, noteData);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/babies/:babyId/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStandaloneNote(id);
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  app.put("/api/notes/:id/link", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { recordType, recordId } = req.body;
      
      if (!recordType || !recordId) {
        return res.status(400).json({ message: "recordType and recordId are required" });
      }
      
      const note = await storage.linkNoteToRecord(id, recordType, recordId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to link note" });
    }
  });

  // Pregnancy tracking routes
  
  // User pregnancy mode toggle
  app.put("/api/users/:id/pregnancy-mode", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { pregnancyMode } = req.body;
      
      if (typeof pregnancyMode !== 'boolean') {
        return res.status(400).json({ message: "pregnancyMode must be a boolean" });
      }
      
      const updatedUser = await storage.updateUserPregnancyMode(id, pregnancyMode);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update pregnancy mode" });
    }
  });

  // Pregnancy routes
  app.get("/api/users/:userId/pregnancies", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const pregnancies = await storage.getPregnancies(userId);
      res.json(pregnancies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pregnancies" });
    }
  });

  app.get("/api/pregnancies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pregnancy = await storage.getPregnancy(id);
      if (!pregnancy) {
        return res.status(404).json({ message: "Pregnancy not found" });
      }
      res.json(pregnancy);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pregnancy" });
    }
  });

  app.post("/api/users/:userId/pregnancies", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const pregnancyData = insertPregnancySchema.parse({ ...req.body, userId });
      const pregnancy = await storage.createPregnancy(pregnancyData);
      res.status(201).json(pregnancy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pregnancy data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pregnancy" });
    }
  });

  app.put("/api/pregnancies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pregnancyData = insertPregnancySchema.partial().parse(req.body);
      const pregnancy = await storage.updatePregnancy(id, pregnancyData);
      if (!pregnancy) {
        return res.status(404).json({ message: "Pregnancy not found" });
      }
      res.json(pregnancy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pregnancy data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update pregnancy" });
    }
  });

  // Contraction tracking
  app.get("/api/pregnancies/:pregnancyId/contractions", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const contractions = await storage.getContractions(pregnancyId, limit);
      res.json(contractions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contractions" });
    }
  });

  app.post("/api/pregnancies/:pregnancyId/contractions", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const contractionData = insertContractionSchema.parse({ ...req.body, pregnancyId });
      const contraction = await storage.createContraction(contractionData);
      res.status(201).json(contraction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contraction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contraction" });
    }
  });

  app.put("/api/contractions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contractionData = insertContractionSchema.partial().parse(req.body);
      
      // Calculate duration if endTime is provided
      if (contractionData.endTime && contractionData.startTime) {
        const start = new Date(contractionData.startTime);
        const end = new Date(contractionData.endTime);
        contractionData.duration = Math.round((end.getTime() - start.getTime()) / 1000); // in seconds
      }
      
      const contraction = await storage.updateContraction(id, contractionData);
      if (!contraction) {
        return res.status(404).json({ message: "Contraction not found" });
      }
      res.json(contraction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contraction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update contraction" });
    }
  });

  // Fetal Movement tracking
  app.get("/api/pregnancies/:pregnancyId/movements", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const movements = await storage.getFetalMovements(pregnancyId, limit);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fetal movements" });
    }
  });

  app.post("/api/pregnancies/:pregnancyId/movements", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const movementData = insertFetalMovementSchema.parse({ ...req.body, pregnancyId });
      const movement = await storage.createFetalMovement(movementData);
      res.status(201).json(movement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid fetal movement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create fetal movement" });
    }
  });

  // Maternal Health tracking
  app.get("/api/pregnancies/:pregnancyId/health", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const type = req.query.type as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const healthData = await storage.getMaternalHealth(pregnancyId, type, limit);
      res.json(healthData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maternal health data" });
    }
  });

  app.post("/api/pregnancies/:pregnancyId/health", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const healthData = insertMaternalHealthSchema.parse({ ...req.body, pregnancyId });
      const health = await storage.createMaternalHealth(healthData);
      res.status(201).json(health);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maternal health data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create maternal health record" });
    }
  });

  app.put("/api/maternal-health/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const healthData = insertMaternalHealthSchema.partial().parse(req.body);
      const health = await storage.updateMaternalHealth(id, healthData);
      if (!health) {
        return res.status(404).json({ message: "Maternal health record not found" });
      }
      res.json(health);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid maternal health data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update maternal health record" });
    }
  });

  // Pregnancy Appointments
  app.get("/api/pregnancies/:pregnancyId/appointments", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const appointments = await storage.getPregnancyAppointments(pregnancyId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pregnancy appointments" });
    }
  });

  app.post("/api/pregnancies/:pregnancyId/appointments", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const appointmentData = insertPregnancyAppointmentSchema.parse({ ...req.body, pregnancyId });
      const appointment = await storage.createPregnancyAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pregnancy appointment" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointmentData = insertPregnancyAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updatePregnancyAppointment(id, appointmentData);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update pregnancy appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePregnancyAppointment(id);
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Preparation Checklists
  app.get("/api/pregnancies/:pregnancyId/checklists", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const type = req.query.type as string | undefined;
      const checklists = await storage.getPreparationChecklists(pregnancyId, type);
      res.json(checklists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch preparation checklists" });
    }
  });

  app.post("/api/pregnancies/:pregnancyId/checklists", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const checklistData = insertPreparationChecklistSchema.parse({ ...req.body, pregnancyId });
      const checklist = await storage.createPreparationChecklist(checklistData);
      res.status(201).json(checklist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid checklist data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create preparation checklist" });
    }
  });

  app.put("/api/checklists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const checklistData = insertPreparationChecklistSchema.partial().parse(req.body);
      const checklist = await storage.updatePreparationChecklist(id, checklistData);
      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json(checklist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid checklist data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update preparation checklist" });
    }
  });

  // Pregnancy Timeline and Stats
  app.get("/api/pregnancies/:id/gestational-age", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pregnancy = await storage.getPregnancy(id);
      
      if (!pregnancy) {
        return res.status(404).json({ message: "Pregnancy not found" });
      }
      
      const lmp = new Date(pregnancy.lastPeriodDate);
      const today = new Date();
      
      // Calculate days since LMP
      const daysSinceLMP = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate weeks and days
      const weeks = Math.floor(daysSinceLMP / 7);
      const days = daysSinceLMP % 7;
      
      // Calculate trimester
      let trimester = 1;
      if (weeks >= 27) {
        trimester = 3;
      } else if (weeks >= 14) {
        trimester = 2;
      }
      
      res.json({
        gestationalAge: {
          weeks,
          days,
          totalDays: daysSinceLMP
        },
        trimester,
        dueDate: pregnancy.estimatedDueDate,
        daysUntilDueDate: Math.floor((new Date(pregnancy.estimatedDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate gestational age" });
    }
  });

  // Baby Birth (Transition from Pregnancy to Baby mode)
  app.post("/api/pregnancies/:pregnancyId/birth", async (req, res) => {
    try {
      const pregnancyId = parseInt(req.params.pregnancyId);
      const { name, birthDate, gender } = req.body;
      
      // Create baby record
      const babyData = insertBabySchema.parse({ name, birthDate, gender });
      const baby = await storage.createBaby(babyData);
      
      // Update pregnancy to inactive and link to baby
      const updatedPregnancy = await storage.updatePregnancy(pregnancyId, { 
        isActive: false, 
        babyId: baby.id 
      });
      
      // Turn off pregnancy mode for user
      if (updatedPregnancy) {
        await storage.updateUserPregnancyMode(updatedPregnancy.userId, false);
      }
      
      res.status(201).json({ baby, pregnancy: updatedPregnancy });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid birth data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record birth" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
