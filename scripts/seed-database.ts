/**
 * Database Seeding Script for TinyTracks POC
 * Creates sample data for testing and demonstration
 */

import { storage } from "../server/storage";
import bcrypt from "bcrypt";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // 1. Create test user
    console.log("Creating test user...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const testUser = await storage.createUser({
      username: "demo@tinytracks.app",
      password: hashedPassword,
      pregnancyMode: false,
    });
    console.log(`✅ Created user: ${testUser.username} (ID: ${testUser.id})`);

    // 2. Create baby profile
    console.log("\nCreating baby profile...");
    const babyBirthDate = new Date();
    babyBirthDate.setMonth(babyBirthDate.getMonth() - 2); // 2 months old
    
    const baby = await storage.createBaby({
      name: "Emma",
      birthDate: babyBirthDate,
      gender: "female",
    });
    console.log(`✅ Created baby: ${baby.name} (ID: ${baby.id})`);

    // 3. Create feeding records
    console.log("\nCreating feeding records...");
    const now = new Date();
    const feedTimes = [
      { hours: 2, amount: "120", type: "bottle" },
      { hours: 5, amount: "100", type: "bottle" },
      { hours: 8, duration: 15, type: "breast_left" },
      { hours: 11, duration: 20, type: "breast_both" },
      { hours: 14, amount: "110", type: "bottle" },
    ];

    for (const feed of feedTimes) {
      const feedTime = new Date(now);
      feedTime.setHours(feedTime.getHours() - feed.hours);
      
      await storage.createFeed({
        babyId: baby.id,
        type: feed.type,
        amount: (feed as any).amount || null,
        duration: (feed as any).duration || null,
        timestamp: feedTime,
        notes: null,
        attachedNotes: null,
        attachedMedia: null,
        tags: null,
      });
    }
    console.log(`✅ Created ${feedTimes.length} feeding records`);

    // 4. Create nappy changes
    console.log("\nCreating nappy change records...");
    const nappyTimes = [
      { hours: 1, type: "wet" },
      { hours: 3, type: "soiled" },
      { hours: 6, type: "both" },
      { hours: 9, type: "wet" },
      { hours: 12, type: "soiled" },
    ];

    for (const nappy of nappyTimes) {
      const nappyTime = new Date(now);
      nappyTime.setHours(nappyTime.getHours() - nappy.hours);
      
      await storage.createNappy({
        babyId: baby.id,
        type: nappy.type,
        timestamp: nappyTime,
        notes: null,
        attachedNotes: null,
        attachedMedia: null,
        tags: null,
      });
    }
    console.log(`✅ Created ${nappyTimes.length} nappy change records`);

    // 5. Create sleep sessions
    console.log("\nCreating sleep session records...");
    const sleepSessions = [
      { hoursAgo: 8, duration: 120, type: "night" },
      { hoursAgo: 5, duration: 45, type: "nap" },
      { hoursAgo: 2, duration: 30, type: "nap" },
    ];

    for (const sleep of sleepSessions) {
      const startTime = new Date(now);
      startTime.setHours(startTime.getHours() - sleep.hoursAgo);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + sleep.duration);
      
      await storage.createSleepSession({
        babyId: baby.id,
        startTime,
        endTime,
        duration: sleep.duration,
        type: sleep.type,
        location: "crib",
        notes: null,
        attachedNotes: null,
        attachedMedia: null,
        tags: null,
      });
    }
    console.log(`✅ Created ${sleepSessions.length} sleep session records`);

    // 6. Create growth records
    console.log("\nCreating growth records...");
    const growthRecords = [
      { daysAgo: 0, weight: "5.2", height: "56", headCircumference: "38" },
      { daysAgo: 30, weight: "4.8", height: "54", headCircumference: "37" },
      { daysAgo: 60, weight: "4.2", height: "52", headCircumference: "36" },
    ];

    for (const growth of growthRecords) {
      const recordDate = new Date(now);
      recordDate.setDate(recordDate.getDate() - growth.daysAgo);
      
      await storage.createGrowthRecord({
        babyId: baby.id,
        weight: growth.weight,
        height: growth.height,
        headCircumference: growth.headCircumference,
        timestamp: recordDate,
        notes: null,
      });
    }
    console.log(`✅ Created ${growthRecords.length} growth records`);

    // 7. Create health record
    console.log("\nCreating health record...");
    await storage.createHealthRecord({
      babyId: baby.id,
      type: "temperature",
      value: "36.8",
      details: { unit: "celsius", normal: true },
      timestamp: new Date(),
      photos: null,
      notes: "Temperature checked before bedtime",
      attachedNotes: null,
      attachedMedia: null,
      tags: null,
    });
    console.log("✅ Created 1 health record");

    // 8. Create vaccination record
    console.log("\nCreating vaccination record...");
    const vaccinationDate = new Date(babyBirthDate);
    vaccinationDate.setDate(vaccinationDate.getDate() + 7); // 1 week after birth
    
    await storage.createVaccination({
      babyId: baby.id,
      vaccineName: "Hepatitis B",
      dateGiven: vaccinationDate,
      nextDueDate: null,
      location: "City Hospital",
      notes: "First dose administered",
    });
    console.log("✅ Created 1 vaccination record");

    // 9. Create standalone note
    console.log("\nCreating standalone note...");
    await storage.createStandaloneNote({
      babyId: baby.id,
      title: "First Smile",
      content: "Emma smiled for the first time today! It was the most beautiful moment.",
      attachedMedia: null,
      tags: ["milestone"],
      timestamp: new Date(),
      linkedToType: null,
      linkedToId: null,
    });
    console.log("✅ Created 1 standalone note");

    // 10. Create pregnancy data (for testing pregnancy mode)
    console.log("\nCreating pregnancy data...");
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 90); // 90 days from now
    
    const lmpDate = new Date();
    lmpDate.setDate(lmpDate.getDate() - 190); // ~27 weeks ago
    
    const pregnancy = await storage.createPregnancy({
      userId: testUser.id,
      estimatedDueDate: dueDate,
      lastPeriodDate: lmpDate,
      notes: "Feeling good, everything on track",
      isActive: true,
      babyId: null,
    });
    console.log(`✅ Created pregnancy record (ID: ${pregnancy.id})`);

    // Update user to pregnancy mode
    await storage.updateUserPregnancyMode(testUser.id, true);
    console.log("✅ Enabled pregnancy mode for user");

    // Create some contractions
    console.log("\nCreating contraction records...");
    const contractionTimes = [
      { minutesAgo: 10, duration: 45, intensity: 5 },
      { minutesAgo: 20, duration: 50, intensity: 6 },
      { minutesAgo: 32, duration: 48, intensity: 5 },
    ];

    for (const contraction of contractionTimes) {
      const startTime = new Date(now);
      startTime.setMinutes(startTime.getMinutes() - contraction.minutesAgo);
      
      const endTime = new Date(startTime);
      endTime.setSeconds(endTime.getSeconds() + contraction.duration);
      
      await storage.createContraction({
        pregnancyId: pregnancy.id,
        startTime,
        endTime,
        duration: contraction.duration,
        intensity: contraction.intensity,
        notes: null,
      });
    }
    console.log(`✅ Created ${contractionTimes.length} contraction records`);

    // Create fetal movements
    console.log("\nCreating fetal movement records...");
    for (let i = 0; i < 5; i++) {
      const movementTime = new Date(now);
      movementTime.setHours(movementTime.getHours() - (i * 2));
      
      await storage.createFetalMovement({
        pregnancyId: pregnancy.id,
        timestamp: movementTime,
        duration: null,
        responseToStimuli: i === 0 ? "music" : null,
        notes: null,
      });
    }
    console.log("✅ Created 5 fetal movement records");

    // Create maternal health records
    console.log("\nCreating maternal health records...");
    await storage.createMaternalHealth({
      pregnancyId: pregnancy.id,
      type: "weight",
      timestamp: new Date(),
      value: "68.5",
      details: { unit: "kg" },
      notes: null,
    });

    await storage.createMaternalHealth({
      pregnancyId: pregnancy.id,
      type: "blood_pressure",
      timestamp: new Date(),
      value: "120/80",
      details: { systolic: 120, diastolic: 80 },
      notes: "Normal range",
    });
    console.log("✅ Created 2 maternal health records");

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: 1`);
    console.log(`   - Babies: 1`);
    console.log(`   - Feeds: ${feedTimes.length}`);
    console.log(`   - Nappies: ${nappyTimes.length}`);
    console.log(`   - Sleep Sessions: ${sleepSessions.length}`);
    console.log(`   - Growth Records: ${growthRecords.length}`);
    console.log(`   - Health Records: 1`);
    console.log(`   - Vaccinations: 1`);
    console.log(`   - Notes: 1`);
    console.log(`   - Pregnancies: 1`);
    console.log(`   - Contractions: ${contractionTimes.length}`);
    console.log(`   - Fetal Movements: 5`);
    console.log(`   - Maternal Health: 2`);
    console.log("\n🔑 Test Credentials:");
    console.log(`   Email: demo@tinytracks.app`);
    console.log(`   Password: password123`);
    console.log("\n💡 Note: Baby ID is ${baby.id} if you need it for testing\n");

  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seeding function
seedDatabase();

