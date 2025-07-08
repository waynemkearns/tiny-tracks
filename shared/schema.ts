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
  createdAt: timestamp("created_at").defaultNow(),
});

export const nappies = pgTable("nappies", {
  id: serial("id").primaryKey(),
  babyId: integer("baby_id").notNull().references(() => babies.id),
  type: text("type").notNull(), // "wet", "soiled", "both"
  timestamp: timestamp("timestamp").notNull(),
  notes: text("notes"),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  babyId: integer("baby_id").notNull().references(() => babies.id),
  type: text("type").notNull(), // "temperature", "rash", "mood", "illness", "medication"
  value: text("value"), // temperature value, mood description, etc.
  details: jsonb("details"), // flexible field for various health data
  timestamp: timestamp("timestamp").notNull(),
  photos: text("photos").array(), // array of photo URLs
  notes: text("notes"),
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

// Relations
export const babiesRelations = relations(babies, ({ many }) => ({
  feeds: many(feeds),
  nappies: many(nappies),
  sleepSessions: many(sleepSessions),
  healthRecords: many(healthRecords),
  growthRecords: many(growthRecords),
  vaccinations: many(vaccinations),
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

// Users table (keeping existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
