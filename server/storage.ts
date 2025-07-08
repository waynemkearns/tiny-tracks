import { 
  babies, feeds, nappies, sleepSessions, healthRecords, growthRecords, vaccinations, users,
  type Baby, type InsertBaby, type Feed, type InsertFeed, type Nappy, type InsertNappy,
  type SleepSession, type InsertSleepSession, type HealthRecord, type InsertHealthRecord,
  type GrowthRecord, type InsertGrowthRecord, type Vaccination, type InsertVaccination,
  type User, type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Baby methods
  getBaby(id: number): Promise<Baby | undefined>;
  createBaby(baby: InsertBaby): Promise<Baby>;
  getBabies(): Promise<Baby[]>;

  // Feed methods
  createFeed(feed: InsertFeed): Promise<Feed>;
  getFeeds(babyId: number, limit?: number): Promise<Feed[]>;
  getFeedsByDateRange(babyId: number, startDate: Date, endDate: Date): Promise<Feed[]>;
  updateFeed(id: number, feed: Partial<InsertFeed>): Promise<Feed | undefined>;
  deleteFeed(id: number): Promise<boolean>;

  // Nappy methods
  createNappy(nappy: InsertNappy): Promise<Nappy>;
  getNappies(babyId: number, limit?: number): Promise<Nappy[]>;
  getNappiesByDateRange(babyId: number, startDate: Date, endDate: Date): Promise<Nappy[]>;
  updateNappy(id: number, nappy: Partial<InsertNappy>): Promise<Nappy | undefined>;
  deleteNappy(id: number): Promise<boolean>;

  // Sleep methods
  createSleepSession(sleepSession: InsertSleepSession): Promise<SleepSession>;
  getSleepSessions(babyId: number, limit?: number): Promise<SleepSession[]>;
  getSleepSessionsByDateRange(babyId: number, startDate: Date, endDate: Date): Promise<SleepSession[]>;
  updateSleepSession(id: number, sleepSession: Partial<InsertSleepSession>): Promise<SleepSession | undefined>;
  deleteSleepSession(id: number): Promise<boolean>;
  getActiveSleepSession(babyId: number): Promise<SleepSession | undefined>;

  // Health methods
  createHealthRecord(healthRecord: InsertHealthRecord): Promise<HealthRecord>;
  getHealthRecords(babyId: number, limit?: number): Promise<HealthRecord[]>;
  getHealthRecordsByDateRange(babyId: number, startDate: Date, endDate: Date): Promise<HealthRecord[]>;
  updateHealthRecord(id: number, healthRecord: Partial<InsertHealthRecord>): Promise<HealthRecord | undefined>;
  deleteHealthRecord(id: number): Promise<boolean>;

  // Growth methods
  createGrowthRecord(growthRecord: InsertGrowthRecord): Promise<GrowthRecord>;
  getGrowthRecords(babyId: number): Promise<GrowthRecord[]>;
  updateGrowthRecord(id: number, growthRecord: Partial<InsertGrowthRecord>): Promise<GrowthRecord | undefined>;
  deleteGrowthRecord(id: number): Promise<boolean>;

  // Vaccination methods
  createVaccination(vaccination: InsertVaccination): Promise<Vaccination>;
  getVaccinations(babyId: number): Promise<Vaccination[]>;
  updateVaccination(id: number, vaccination: Partial<InsertVaccination>): Promise<Vaccination | undefined>;
  deleteVaccination(id: number): Promise<boolean>;

  // Analytics methods
  getDailySummary(babyId: number, date: Date): Promise<{
    feedCount: number;
    nappyCount: number;
    sleepDuration: number;
    lastFeed?: Date;
    lastNappy?: Date;
    currentSleepSession?: SleepSession;
  }>;
  getWeeklyStats(babyId: number, startDate: Date): Promise<{
    daily: Array<{
      date: string;
      feedCount: number;
      nappyCount: number;
      sleepDuration: number;
    }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Baby methods
  async getBaby(id: number): Promise<Baby | undefined> {
    const [baby] = await db.select().from(babies).where(eq(babies.id, id));
    return baby || undefined;
  }

  async createBaby(baby: InsertBaby): Promise<Baby> {
    const [newBaby] = await db.insert(babies).values(baby).returning();
    return newBaby;
  }

  async getBabies(): Promise<Baby[]> {
    return await db.select().from(babies).orderBy(desc(babies.createdAt));
  }

  // Feed methods
  async createFeed(feed: InsertFeed): Promise<Feed> {
    const [newFeed] = await db.insert(feeds).values(feed).returning();
    return newFeed;
  }

  async getFeeds(babyId: number, limit = 50): Promise<Feed[]> {
    return await db.select().from(feeds)
      .where(eq(feeds.babyId, babyId))
      .orderBy(desc(feeds.timestamp))
      .limit(limit);
  }

  async getFeedsByDateRange(babyId: number, startDate: Date, endDate: Date): Promise<Feed[]> {
    return await db.select().from(feeds)
      .where(
        and(
          eq(feeds.babyId, babyId),
          gte(feeds.timestamp, startDate),
          lte(feeds.timestamp, endDate)
        )
      )
      .orderBy(desc(feeds.timestamp));
  }

  async updateFeed(id: number, feed: Partial<InsertFeed>): Promise<Feed | undefined> {
    const [updatedFeed] = await db.update(feeds)
      .set(feed)
      .where(eq(feeds.id, id))
      .returning();
    return updatedFeed || undefined;
  }

  async deleteFeed(id: number): Promise<boolean> {
    const result = await db.delete(feeds).where(eq(feeds.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Nappy methods
  async createNappy(nappy: InsertNappy): Promise<Nappy> {
    const [newNappy] = await db.insert(nappies).values(nappy).returning();
    return newNappy;
  }

  async getNappies(babyId: number, limit = 50): Promise<Nappy[]> {
    return await db.select().from(nappies)
      .where(eq(nappies.babyId, babyId))
      .orderBy(desc(nappies.timestamp))
      .limit(limit);
  }

  async getNappiesByDateRange(babyId: number, startDate: Date, endDate: Date): Promise<Nappy[]> {
    return await db.select().from(nappies)
      .where(
        and(
          eq(nappies.babyId, babyId),
          gte(nappies.timestamp, startDate),
          lte(nappies.timestamp, endDate)
        )
      )
      .orderBy(desc(nappies.timestamp));
  }

  async updateNappy(id: number, nappy: Partial<InsertNappy>): Promise<Nappy | undefined> {
    const [updatedNappy] = await db.update(nappies)
      .set(nappy)
      .where(eq(nappies.id, id))
      .returning();
    return updatedNappy || undefined;
  }

  async deleteNappy(id: number): Promise<boolean> {
    const result = await db.delete(nappies).where(eq(nappies.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Sleep methods
  async createSleepSession(sleepSession: InsertSleepSession): Promise<SleepSession> {
    const [newSleepSession] = await db.insert(sleepSessions).values(sleepSession).returning();
    return newSleepSession;
  }

  async getSleepSessions(babyId: number, limit = 50): Promise<SleepSession[]> {
    return await db.select().from(sleepSessions)
      .where(eq(sleepSessions.babyId, babyId))
      .orderBy(desc(sleepSessions.startTime))
      .limit(limit);
  }

  async getSleepSessionsByDateRange(babyId: number, startDate: Date, endDate: Date): Promise<SleepSession[]> {
    return await db.select().from(sleepSessions)
      .where(
        and(
          eq(sleepSessions.babyId, babyId),
          gte(sleepSessions.startTime, startDate),
          lte(sleepSessions.startTime, endDate)
        )
      )
      .orderBy(desc(sleepSessions.startTime));
  }

  async updateSleepSession(id: number, sleepSession: Partial<InsertSleepSession>): Promise<SleepSession | undefined> {
    const [updatedSleepSession] = await db.update(sleepSessions)
      .set(sleepSession)
      .where(eq(sleepSessions.id, id))
      .returning();
    return updatedSleepSession || undefined;
  }

  async deleteSleepSession(id: number): Promise<boolean> {
    const result = await db.delete(sleepSessions).where(eq(sleepSessions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getActiveSleepSession(babyId: number): Promise<SleepSession | undefined> {
    const [activeSleep] = await db.select().from(sleepSessions)
      .where(
        and(
          eq(sleepSessions.babyId, babyId),
          sql`${sleepSessions.endTime} IS NULL`
        )
      )
      .orderBy(desc(sleepSessions.startTime))
      .limit(1);
    return activeSleep || undefined;
  }

  // Health methods
  async createHealthRecord(healthRecord: InsertHealthRecord): Promise<HealthRecord> {
    const [newHealthRecord] = await db.insert(healthRecords).values(healthRecord).returning();
    return newHealthRecord;
  }

  async getHealthRecords(babyId: number, limit = 50): Promise<HealthRecord[]> {
    return await db.select().from(healthRecords)
      .where(eq(healthRecords.babyId, babyId))
      .orderBy(desc(healthRecords.timestamp))
      .limit(limit);
  }

  async getHealthRecordsByDateRange(babyId: number, startDate: Date, endDate: Date): Promise<HealthRecord[]> {
    return await db.select().from(healthRecords)
      .where(
        and(
          eq(healthRecords.babyId, babyId),
          gte(healthRecords.timestamp, startDate),
          lte(healthRecords.timestamp, endDate)
        )
      )
      .orderBy(desc(healthRecords.timestamp));
  }

  async updateHealthRecord(id: number, healthRecord: Partial<InsertHealthRecord>): Promise<HealthRecord | undefined> {
    const [updatedHealthRecord] = await db.update(healthRecords)
      .set(healthRecord)
      .where(eq(healthRecords.id, id))
      .returning();
    return updatedHealthRecord || undefined;
  }

  async deleteHealthRecord(id: number): Promise<boolean> {
    const result = await db.delete(healthRecords).where(eq(healthRecords.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Growth methods
  async createGrowthRecord(growthRecord: InsertGrowthRecord): Promise<GrowthRecord> {
    const [newGrowthRecord] = await db.insert(growthRecords).values(growthRecord).returning();
    return newGrowthRecord;
  }

  async getGrowthRecords(babyId: number): Promise<GrowthRecord[]> {
    return await db.select().from(growthRecords)
      .where(eq(growthRecords.babyId, babyId))
      .orderBy(desc(growthRecords.timestamp));
  }

  async updateGrowthRecord(id: number, growthRecord: Partial<InsertGrowthRecord>): Promise<GrowthRecord | undefined> {
    const [updatedGrowthRecord] = await db.update(growthRecords)
      .set(growthRecord)
      .where(eq(growthRecords.id, id))
      .returning();
    return updatedGrowthRecord || undefined;
  }

  async deleteGrowthRecord(id: number): Promise<boolean> {
    const result = await db.delete(growthRecords).where(eq(growthRecords.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Vaccination methods
  async createVaccination(vaccination: InsertVaccination): Promise<Vaccination> {
    const [newVaccination] = await db.insert(vaccinations).values(vaccination).returning();
    return newVaccination;
  }

  async getVaccinations(babyId: number): Promise<Vaccination[]> {
    return await db.select().from(vaccinations)
      .where(eq(vaccinations.babyId, babyId))
      .orderBy(desc(vaccinations.dateGiven));
  }

  async updateVaccination(id: number, vaccination: Partial<InsertVaccination>): Promise<Vaccination | undefined> {
    const [updatedVaccination] = await db.update(vaccinations)
      .set(vaccination)
      .where(eq(vaccinations.id, id))
      .returning();
    return updatedVaccination || undefined;
  }

  async deleteVaccination(id: number): Promise<boolean> {
    const result = await db.delete(vaccinations).where(eq(vaccinations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Analytics methods
  async getDailySummary(babyId: number, date: Date): Promise<{
    feedCount: number;
    nappyCount: number;
    sleepDuration: number;
    lastFeed?: Date;
    lastNappy?: Date;
    currentSleepSession?: SleepSession;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [feedsToday, nappiesShooday, sleepSessionsToday, activeSleep, lastFeed, lastNappy] = await Promise.all([
      this.getFeedsByDateRange(babyId, startOfDay, endOfDay),
      this.getNappiesByDateRange(babyId, startOfDay, endOfDay),
      this.getSleepSessionsByDateRange(babyId, startOfDay, endOfDay),
      this.getActiveSleepSession(babyId),
      this.getFeeds(babyId, 1),
      this.getNappies(babyId, 1)
    ]);

    const sleepDuration = sleepSessionsToday.reduce((total, session) => {
      if (session.duration) {
        return total + session.duration;
      }
      return total;
    }, 0);

    return {
      feedCount: feedsToday.length,
      nappyCount: nappiesShooday.length,
      sleepDuration,
      lastFeed: lastFeed[0]?.timestamp,
      lastNappy: lastNappy[0]?.timestamp,
      currentSleepSession: activeSleep,
    };
  }

  async getWeeklyStats(babyId: number, startDate: Date): Promise<{
    daily: Array<{
      date: string;
      feedCount: number;
      nappyCount: number;
      sleepDuration: number;
    }>;
  }> {
    const daily = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const summary = await this.getDailySummary(babyId, currentDate);
      daily.push({
        date: currentDate.toISOString().split('T')[0],
        feedCount: summary.feedCount,
        nappyCount: summary.nappyCount,
        sleepDuration: summary.sleepDuration,
      });
    }

    return { daily };
  }
}

export const storage = new DatabaseStorage();
