import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const babies = pgTable("babies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthDate: timestamp("birth_date").notNull(),
  gender: text("gender"), // "male", "female", "other"
  createdAt: timestamp("created_at").defaultNow(),
});

export const feeds = pgTable("feeds", {
  id: serial("id").primaryKey(),
  babyId: integer("baby_id").notNull().references(() => babies.id),
  type: text("type").notNull(), // "bottle", "breast_left", "breast_right", "breast_both"
  amount: decimal("amount"), // in ml for bottles
  duration: integer("duration"), // in minutes for breastfeeding
  timestamp: timestamp("timestamp").notNull(),
  notes: text("notes"),
  attachedNotes: text("attached_notes").array(), // array of additional text notes
  attachedMedia: text("attached_media").array(), // array of image file paths/URLs
  tags: text("tags").array(), // optional tags like "unusual", "doctor follow-up"
  createdAt: timestamp("created_at").defaultNow(),
});

export const nappies = pgTable("nappies", {
  id: serial("id").primaryKey(),
  babyId: integer("baby_id").notNull().references(() => babies.id),
  type: text("type").notNull(), // "wet", "soiled", "both"
  timestamp: timestamp("timestamp").notNull(),
  notes: text("notes"),
  attachedNotes: text("attached_notes").array(), // array of additional text notes
  attachedMedia: text("attached_media").array(), // array of image file paths/URLs
  tags: text("tags").array(), // optional tags like "unusual", "doctor follow-up"
  createdAt: timestamp("created_at").defaultNow(),
});

export const sleepSessions = pgTable("sleep_sessions", {
  id: serial("id").primaryKey(),
  babyId: integer("baby_id").notNull().references(() => babies.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes, calculated when endTime is set
  type: text("type").notNull(), // "nap", "night"
  location: text("location"), // "crib", "bed", "stroller", etc.
  notes: text("notes"),
  attachedNotes: text("attached_notes").array(), // array of additional text notes
  attachedMedia: text("attached_media").array(), // array of image file paths/URLs
  tags: text("tags").array(), // optional tags like "unusual", "doctor follow-up"
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  babyId: integer("baby_id").notNull().references(() => babies.id),
  type: text("type").notNull(), // "temperature", "rash", "mood", "illness", "medication"
  value: text("value"), // temperature value, mood description, etc.
  details: jsonb("details"), // flexible field for various health data
  timestamp: timestamp("timestamp").notNull(),
  photos: text("photos").array(), // array of photo URLs (legacy field)
  notes: text("notes"),
  attachedNotes: text("attached_notes").array(), // array of additional text notes
  attachedMedia: text("attached_media").array(), // array of image file paths/URLs
  tags: text("tags").array(), // optional tags like "unusual", "doctor follow-up"
  createdAt: timestamp("created_at").defaultNow(),
});

export const growthRecords = pgTable("growth_records", {
  id: serial("id").primaryKey(),
  babyId: integer("baby_id").notNull().references(() => babies.id),
  weight: decimal("weight"), // in kg
  height: decimal("height"), // in cm
  headCircumference: decimal("head_circumference"), // in cm
  timestamp: timestamp("timestamp").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vaccinations = pgTable("vaccinations", {
  id: serial("id").primaryKey(),
  babyId: integer("baby_id").notNull().references(() => babies.id),
  vaccineName: text("vaccine_name").notNull(),
  dateGiven: timestamp("date_given").notNull(),
  nextDueDate: timestamp("next_due_date"),
  location: text("location"), // clinic, hospital, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Standalone notes table for unstructured uploads and notes
export const standaloneNotes = pgTable("standalone_notes", {
  id: serial("id").primaryKey(),
  babyId: integer("baby_id").notNull().references(() => babies.id),
  title: text("title"), // optional title for the note
  content: text("content"), // free text content
  attachedMedia: text("attached_media").array(), // array of image file paths/URLs
  tags: text("tags").array(), // optional tags like "urgent", "doctor follow-up"
  timestamp: timestamp("timestamp").notNull(), // when the note was captured/uploaded
  linkedToType: text("linked_to_type"), // "feed", "nappy", "sleep", "health", null for unlinked
  linkedToId: integer("linked_to_id"), // ID of the linked record
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const babiesRelations = relations(babies, ({ many }) => ({
  feeds: many(feeds),
  nappies: many(nappies),
  sleepSessions: many(sleepSessions),
  healthRecords: many(healthRecords),
  growthRecords: many(growthRecords),
  vaccinations: many(vaccinations),
  standaloneNotes: many(standaloneNotes),
}));

export const feedsRelations = relations(feeds, ({ one }) => ({
  baby: one(babies, {
    fields: [feeds.babyId],
    references: [babies.id],
  }),
}));

export const nappiesRelations = relations(nappies, ({ one }) => ({
  baby: one(babies, {
    fields: [nappies.babyId],
    references: [babies.id],
  }),
}));

export const sleepSessionsRelations = relations(sleepSessions, ({ one }) => ({
  baby: one(babies, {
    fields: [sleepSessions.babyId],
    references: [babies.id],
  }),
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  baby: one(babies, {
    fields: [healthRecords.babyId],
    references: [babies.id],
  }),
}));

export const growthRecordsRelations = relations(growthRecords, ({ one }) => ({
  baby: one(babies, {
    fields: [growthRecords.babyId],
    references: [babies.id],
  }),
}));

export const vaccinationsRelations = relations(vaccinations, ({ one }) => ({
  baby: one(babies, {
    fields: [vaccinations.babyId],
    references: [babies.id],
  }),
}));

export const standaloneNotesRelations = relations(standaloneNotes, ({ one }) => ({
  baby: one(babies, {
    fields: [standaloneNotes.babyId],
    references: [babies.id],
  }),
}));

// Insert schemas
export const insertBabySchema = createInsertSchema(babies).omit({
  id: true,
  createdAt: true,
});

export const insertFeedSchema = createInsertSchema(feeds).omit({
  id: true,
  createdAt: true,
});

export const insertNappySchema = createInsertSchema(nappies).omit({
  id: true,
  createdAt: true,
});

export const insertSleepSessionSchema = createInsertSchema(sleepSessions).omit({
  id: true,
  createdAt: true,
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true,
  createdAt: true,
});

export const insertGrowthRecordSchema = createInsertSchema(growthRecords).omit({
  id: true,
  createdAt: true,
});

export const insertVaccinationSchema = createInsertSchema(vaccinations).omit({
  id: true,
  createdAt: true,
});

export const insertStandaloneNoteSchema = createInsertSchema(standaloneNotes).omit({
  id: true,
  createdAt: true,
});

// Types
export type Baby = typeof babies.$inferSelect;
export type InsertBaby = z.infer<typeof insertBabySchema>;

export type Feed = typeof feeds.$inferSelect;
export type InsertFeed = z.infer<typeof insertFeedSchema>;

export type Nappy = typeof nappies.$inferSelect;
export type InsertNappy = z.infer<typeof insertNappySchema>;

export type SleepSession = typeof sleepSessions.$inferSelect;
export type InsertSleepSession = z.infer<typeof insertSleepSessionSchema>;

export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;

export type GrowthRecord = typeof growthRecords.$inferSelect;
export type InsertGrowthRecord = z.infer<typeof insertGrowthRecordSchema>;

export type Vaccination = typeof vaccinations.$inferSelect;
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;

export type StandaloneNote = typeof standaloneNotes.$inferSelect;
export type InsertStandaloneNote = z.infer<typeof insertStandaloneNoteSchema>;

// Pregnancy tracking tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  pregnancyMode: boolean("pregnancy_mode").default(false),
});

export const pregnancies = pgTable("pregnancies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  estimatedDueDate: timestamp("estimated_due_date").notNull(),
  lastPeriodDate: timestamp("last_period_date").notNull(),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  babyId: integer("baby_id").references(() => babies.id), // Will be populated after birth
  createdAt: timestamp("created_at").defaultNow(),
});

export const contractions = pgTable("contractions", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  intensity: integer("intensity"), // 1-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fetalMovements = pgTable("fetal_movements", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  timestamp: timestamp("timestamp").notNull(),
  duration: integer("duration"), // in seconds, optional
  responseToStimuli: text("response_to_stimuli"), // e.g., "food", "music", "touch"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const maternalHealth = pgTable("maternal_health", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  type: text("type").notNull(), // "blood_pressure", "weight", "symptom", "mood"
  timestamp: timestamp("timestamp").notNull(),
  value: text("value"), // Could be BP reading, weight in kg, etc.
  details: jsonb("details"), // Additional fields based on type
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pregnancyAppointments = pgTable("pregnancy_appointments", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  notes: text("notes"),
  attachedMedia: text("attached_media").array(), // For ultrasound images
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const preparationChecklists = pgTable("preparation_checklists", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  type: text("type").notNull(), // "birth_plan", "hospital_bag", "nursery"
  title: text("title").notNull(),
  items: jsonb("items"), // Array of {name: string, completed: boolean}
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for pregnancy tables
export const userRelations = relations(users, ({ many }) => ({
  pregnancies: many(pregnancies),
}));

export const pregnancyRelations = relations(pregnancies, ({ one, many }) => ({
  user: one(users, {
    fields: [pregnancies.userId],
    references: [users.id],
  }),
  baby: one(babies, {
    fields: [pregnancies.babyId],
    references: [babies.id],
  }),
  contractions: many(contractions),
  fetalMovements: many(fetalMovements),
  maternalHealth: many(maternalHealth),
  appointments: many(pregnancyAppointments),
  checklists: many(preparationChecklists),
}));

// Insert schemas for pregnancy tables
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  pregnancyMode: true,
});

export const insertPregnancySchema = createInsertSchema(pregnancies).omit({
  id: true,
  createdAt: true,
});

export const insertContractionSchema = createInsertSchema(contractions).omit({
  id: true,
  createdAt: true,
});

export const insertFetalMovementSchema = createInsertSchema(fetalMovements).omit({
  id: true,
  createdAt: true,
});

export const insertMaternalHealthSchema = createInsertSchema(maternalHealth).omit({
  id: true,
  createdAt: true,
});

export const insertPregnancyAppointmentSchema = createInsertSchema(pregnancyAppointments).omit({
  id: true,
  createdAt: true,
});

export const insertPreparationChecklistSchema = createInsertSchema(preparationChecklists).omit({
  id: true,
  createdAt: true,
});

// Types for pregnancy tables
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Pregnancy = typeof pregnancies.$inferSelect;
export type InsertPregnancy = z.infer<typeof insertPregnancySchema>;

export type Contraction = typeof contractions.$inferSelect;
export type InsertContraction = z.infer<typeof insertContractionSchema>;

export type FetalMovement = typeof fetalMovements.$inferSelect;
export type InsertFetalMovement = z.infer<typeof insertFetalMovementSchema>;

export type MaternalHealth = typeof maternalHealth.$inferSelect;
export type InsertMaternalHealth = z.infer<typeof insertMaternalHealthSchema>;

export type PregnancyAppointment = typeof pregnancyAppointments.$inferSelect;
export type InsertPregnancyAppointment = z.infer<typeof insertPregnancyAppointmentSchema>;

export type PreparationChecklist = typeof preparationChecklists.$inferSelect;
export type InsertPreparationChecklist = z.infer<typeof insertPreparationChecklistSchema>;
