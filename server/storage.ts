import { 
  babies, feeds, nappies, sleepSessions, healthRecords, growthRecords, vaccinations, users, standaloneNotes,
  pregnancies, contractions, fetalMovements, maternalHealth, pregnancyAppointments, preparationChecklists,
  type Baby, type InsertBaby, type Feed, type InsertFeed, type Nappy, type InsertNappy,
  type SleepSession, type InsertSleepSession, type HealthRecord, type InsertHealthRecord,
  type GrowthRecord, type InsertGrowthRecord, type Vaccination, type InsertVaccination,
  type User, type InsertUser, type StandaloneNote, type InsertStandaloneNote,
  type Pregnancy, type InsertPregnancy, type Contraction, type InsertContraction,
  type FetalMovement, type InsertFetalMovement, type MaternalHealth, type InsertMaternalHealth,
  type PregnancyAppointment, type InsertPregnancyAppointment, type PreparationChecklist, type InsertPreparationChecklist
} from "./shared";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPregnancyMode(id: number, pregnancyMode: boolean): Promise<User | undefined>;

  // Pregnancy tracking methods
  createPregnancy(pregnancy: InsertPregnancy): Promise<Pregnancy>;
  getPregnancy(id: number): Promise<Pregnancy | undefined>;
  getPregnancies(userId: number): Promise<Pregnancy[]>;
  updatePregnancy(id: number, pregnancy: Partial<InsertPregnancy>): Promise<Pregnancy | undefined>;
  
  // Contraction tracking
  createContraction(contraction: InsertContraction): Promise<Contraction>;
  getContractions(pregnancyId: number, limit?: number): Promise<Contraction[]>;
  updateContraction(id: number, contraction: Partial<InsertContraction>): Promise<Contraction | undefined>;
  
  // Fetal Movement tracking
  createFetalMovement(movement: InsertFetalMovement): Promise<FetalMovement>;
  getFetalMovements(pregnancyId: number, limit?: number): Promise<FetalMovement[]>;
  
  // Maternal Health tracking
  createMaternalHealth(health: InsertMaternalHealth): Promise<MaternalHealth>;
  getMaternalHealth(pregnancyId: number, type?: string, limit?: number): Promise<MaternalHealth[]>;
  updateMaternalHealth(id: number, health: Partial<InsertMaternalHealth>): Promise<MaternalHealth | undefined>;
  
  // Pregnancy Appointments
  createPregnancyAppointment(appointment: InsertPregnancyAppointment): Promise<PregnancyAppointment>;
  getPregnancyAppointments(pregnancyId: number): Promise<PregnancyAppointment[]>;
  updatePregnancyAppointment(id: number, appointment: Partial<InsertPregnancyAppointment>): Promise<PregnancyAppointment | undefined>;
  deletePregnancyAppointment(id: number): Promise<boolean>;
  
  // Preparation Checklists
  createPreparationChecklist(checklist: InsertPreparationChecklist): Promise<PreparationChecklist>;
  getPreparationChecklists(pregnancyId: number, type?: string): Promise<PreparationChecklist[]>;
  updatePreparationChecklist(id: number, checklist: Partial<InsertPreparationChecklist>): Promise<PreparationChecklist | undefined>;

  // Baby methods
  getBaby(id: number): Promise<Baby | undefined>;
  createBaby(baby: InsertBaby): Promise<Baby>;
  updateBaby(id: number, baby: Partial<InsertBaby>): Promise<Baby | undefined>;
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

  // Standalone Notes methods
  createStandaloneNote(note: InsertStandaloneNote): Promise<StandaloneNote>;
  getStandaloneNotes(babyId: number, limit?: number): Promise<StandaloneNote[]>;
  updateStandaloneNote(id: number, note: Partial<InsertStandaloneNote>): Promise<StandaloneNote | undefined>;
  deleteStandaloneNote(id: number): Promise<boolean>;
  linkNoteToRecord(noteId: number, recordType: string, recordId: number): Promise<StandaloneNote | undefined>;

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

  async updateUserPregnancyMode(id: number, pregnancyMode: boolean): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ pregnancyMode })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Pregnancy tracking methods
  async createPregnancy(pregnancy: InsertPregnancy): Promise<Pregnancy> {
    const [newPregnancy] = await db.insert(pregnancies).values(pregnancy).returning();
    return newPregnancy;
  }

  async getPregnancy(id: number): Promise<Pregnancy | undefined> {
    const [pregnancy] = await db.select().from(pregnancies).where(eq(pregnancies.id, id));
    return pregnancy || undefined;
  }

  async getPregnancies(userId: number): Promise<Pregnancy[]> {
    return await db.select().from(pregnancies)
      .where(eq(pregnancies.userId, userId))
      .orderBy(desc(pregnancies.createdAt));
  }

  async updatePregnancy(id: number, pregnancy: Partial<InsertPregnancy>): Promise<Pregnancy | undefined> {
    const [updatedPregnancy] = await db.update(pregnancies)
      .set(pregnancy)
      .where(eq(pregnancies.id, id))
      .returning();
    return updatedPregnancy || undefined;
  }

  // Contraction tracking
  async createContraction(contraction: InsertContraction): Promise<Contraction> {
    const [newContraction] = await db.insert(contractions).values(contraction).returning();
    return newContraction;
  }

  async getContractions(pregnancyId: number, limit = 50): Promise<Contraction[]> {
    return await db.select().from(contractions)
      .where(eq(contractions.pregnancyId, pregnancyId))
      .orderBy(desc(contractions.startTime))
      .limit(limit);
  }

  async updateContraction(id: number, contraction: Partial<InsertContraction>): Promise<Contraction | undefined> {
    const [updatedContraction] = await db.update(contractions)
      .set(contraction)
      .where(eq(contractions.id, id))
      .returning();
    return updatedContraction || undefined;
  }

  // Fetal Movement tracking
  async createFetalMovement(movement: InsertFetalMovement): Promise<FetalMovement> {
    const [newMovement] = await db.insert(fetalMovements).values(movement).returning();
    return newMovement;
  }

  async getFetalMovements(pregnancyId: number, limit = 50): Promise<FetalMovement[]> {
    return await db.select().from(fetalMovements)
      .where(eq(fetalMovements.pregnancyId, pregnancyId))
      .orderBy(desc(fetalMovements.timestamp))
      .limit(limit);
  }

  // Maternal Health tracking
  async createMaternalHealth(health: InsertMaternalHealth): Promise<MaternalHealth> {
    const [newHealth] = await db.insert(maternalHealth).values(health).returning();
    return newHealth;
  }

  async getMaternalHealth(pregnancyId: number, type?: string, limit = 50): Promise<MaternalHealth[]> {
    if (type) {
      return await db.select().from(maternalHealth)
        .where(
          and(
            eq(maternalHealth.pregnancyId, pregnancyId),
            eq(maternalHealth.type, type)
          )
        )
        .orderBy(desc(maternalHealth.timestamp))
        .limit(limit);
    } else {
      return await db.select().from(maternalHealth)
        .where(eq(maternalHealth.pregnancyId, pregnancyId))
        .orderBy(desc(maternalHealth.timestamp))
        .limit(limit);
    }
  }

  async updateMaternalHealth(id: number, health: Partial<InsertMaternalHealth>): Promise<MaternalHealth | undefined> {
    const [updatedHealth] = await db.update(maternalHealth)
      .set(health)
      .where(eq(maternalHealth.id, id))
      .returning();
    return updatedHealth || undefined;
  }

  // Pregnancy Appointments
  async createPregnancyAppointment(appointment: InsertPregnancyAppointment): Promise<PregnancyAppointment> {
    const [newAppointment] = await db.insert(pregnancyAppointments).values(appointment).returning();
    return newAppointment;
  }

  async getPregnancyAppointments(pregnancyId: number): Promise<PregnancyAppointment[]> {
    return await db.select().from(pregnancyAppointments)
      .where(eq(pregnancyAppointments.pregnancyId, pregnancyId))
      .orderBy(pregnancyAppointments.date);
  }

  async updatePregnancyAppointment(id: number, appointment: Partial<InsertPregnancyAppointment>): Promise<PregnancyAppointment | undefined> {
    const [updatedAppointment] = await db.update(pregnancyAppointments)
      .set(appointment)
      .where(eq(pregnancyAppointments.id, id))
      .returning();
    return updatedAppointment || undefined;
  }

  async deletePregnancyAppointment(id: number): Promise<boolean> {
    const result = await db.delete(pregnancyAppointments).where(eq(pregnancyAppointments.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Preparation Checklists
  async createPreparationChecklist(checklist: InsertPreparationChecklist): Promise<PreparationChecklist> {
    const [newChecklist] = await db.insert(preparationChecklists).values(checklist).returning();
    return newChecklist;
  }

  async getPreparationChecklists(pregnancyId: number, type?: string): Promise<PreparationChecklist[]> {
    if (type) {
      return await db.select().from(preparationChecklists)
        .where(
          and(
            eq(preparationChecklists.pregnancyId, pregnancyId),
            eq(preparationChecklists.type, type)
          )
        )
        .orderBy(preparationChecklists.createdAt);
    } else {
      return await db.select().from(preparationChecklists)
        .where(eq(preparationChecklists.pregnancyId, pregnancyId))
        .orderBy(preparationChecklists.createdAt);
    }
  }

  async updatePreparationChecklist(id: number, checklist: Partial<InsertPreparationChecklist>): Promise<PreparationChecklist | undefined> {
    const [updatedChecklist] = await db.update(preparationChecklists)
      .set(checklist)
      .where(eq(preparationChecklists.id, id))
      .returning();
    return updatedChecklist || undefined;
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

  async updateBaby(id: number, baby: Partial<InsertBaby>): Promise<Baby | undefined> {
    const [updatedBaby] = await db.update(babies)
      .set(baby)
      .where(eq(babies.id, id))
      .returning();
    return updatedBaby || undefined;
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

  // Standalone Notes methods
  async createStandaloneNote(note: InsertStandaloneNote): Promise<StandaloneNote> {
    const [created] = await db.insert(standaloneNotes).values(note).returning();
    return created;
  }

  async getStandaloneNotes(babyId: number, limit: number = 50): Promise<StandaloneNote[]> {
    return await db
      .select()
      .from(standaloneNotes)
      .where(eq(standaloneNotes.babyId, babyId))
      .orderBy(desc(standaloneNotes.timestamp))
      .limit(limit);
  }

  async updateStandaloneNote(id: number, note: Partial<InsertStandaloneNote>): Promise<StandaloneNote | undefined> {
    const [updated] = await db
      .update(standaloneNotes)
      .set(note)
      .where(eq(standaloneNotes.id, id))
      .returning();
    return updated;
  }

  async deleteStandaloneNote(id: number): Promise<boolean> {
    try {
      const result = await db.delete(standaloneNotes).where(eq(standaloneNotes.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting standalone note:', error);
      return false;
    }
  }

  async linkNoteToRecord(noteId: number, recordType: string, recordId: number): Promise<StandaloneNote | undefined> {
    return await this.updateStandaloneNote(noteId, {
      linkedToType: recordType,
      linkedToId: recordId
    });
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

    const [feedsToday, nappiesToday, sleepSessionsToday, activeSleep, lastFeed, lastNappy] = await Promise.all([
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
      nappyCount: nappiesToday.length,
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
