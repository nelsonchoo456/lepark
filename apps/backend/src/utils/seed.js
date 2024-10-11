const { PrismaClient, Prisma } = require('@prisma/client');
const {
  parksData,
  zonesData,
  speciesData,
  occurrenceData,
  staffData,
  activityLogsData,
  statusLogsData,
  hubsData,
  attractionsData,
  facilitiesData,
  eventsData,
  parkAssetsData,
  sensorsData,
  decarbonizationAreasData,
  plantTasksData,
  seqHistoriesData,
  faqsData
} = require('./mockData');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid'); // Add this import at the top of your file



async function initParksDB() {
  // Ensure the POSTGIS extension is added
  await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS postgis;`;

  // Check if PARK_STATUS_ENUM exists, and create if not
  await prisma.$queryRaw`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PARK_STATUS_ENUM') THEN
        CREATE TYPE "PARK_STATUS_ENUM" AS ENUM ('OPEN', 'CLOSED', 'UNDER_CONSTRUCTION', 'LIMITED_ACCESS');
      END IF;
    END
    $$;
  `;

  // Check if the "Park" table exists and create it if it doesn't
  await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS "Park" (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      address TEXT,
      "contactNumber" TEXT,
      "openingHours" TIMESTAMP[],
      "closingHours" TIMESTAMP[],
      images TEXT[],
      geom GEOMETRY,
      paths GEOMETRY,
      "parkStatus" "PARK_STATUS_ENUM"
    );
  `;
}

async function createPark(data) {
  await initParksDB();

  // Convert date strings to JavaScript Date objects
  const openingHoursArray = data.openingHours.map((date) => new Date(date));
  const closingHoursArray = data.closingHours.map((date) => new Date(date));

  // Prepare the arrays using Prisma.sql and Prisma.join
  const openingHoursParam = Prisma.sql`ARRAY[${Prisma.join(openingHoursArray.map((date) => Prisma.sql`${date}`))}]::timestamp[]`;

  const closingHoursParam = Prisma.sql`ARRAY[${Prisma.join(closingHoursArray.map((date) => Prisma.sql`${date}`))}]::timestamp[]`;

  const imagesParam = Prisma.sql`ARRAY[${Prisma.join(data.images.map((image) => Prisma.sql`${image}`))}]::text[]`;

  // Insert the park record
  const park = await prisma.$queryRaw`
    INSERT INTO "Park" (
      name,
      description,
      address,
      "contactNumber",
      "openingHours",
      "closingHours",
      images,
      geom,
      paths,
      "parkStatus"
    )
    VALUES (
      ${data.name},
      ${data.description},
      ${data.address},
      ${data.contactNumber},
      ${openingHoursParam},
      ${closingHoursParam},
      ${imagesParam},
      ST_GeomFromText(${data.geom}, 4326),
      ST_GeomFromText(${data.paths}, 4326),
      ${data.parkStatus}::"PARK_STATUS_ENUM"
    )
    RETURNING
      id,
      name,
      description,
      address,
      "contactNumber",
      "openingHours",
      "closingHours",
      images,
      ST_AsGeoJSON(geom) AS geom,
      "parkStatus";
  `;

  return park[0];
}

async function initZonesDB() {
  // Ensure the PostGIS extension is enabled
  await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS postgis;`;

  // Create the ZONE_STATUS_ENUM type if it doesn't exist
  await prisma.$queryRaw`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ZONE_STATUS_ENUM') THEN
        CREATE TYPE "ZONE_STATUS_ENUM" AS ENUM ('OPEN', 'CLOSED', 'UNDER_CONSTRUCTION', 'LIMITED_ACCESS');
      END IF;
    END
    $$;
  `;

  // Create the "Zone" table if it doesn't exist
  await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS "Zone" (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      "openingHours" TIMESTAMP[],
      "closingHours" TIMESTAMP[],
      geom GEOMETRY,
      paths GEOMETRY,
      "zoneStatus" "ZONE_STATUS_ENUM",
      "parkId" INT REFERENCES "Park"(id) ON DELETE CASCADE
    );
  `;
}

async function createZone(data) {
  await initZonesDB();

  // Convert date strings to JavaScript Date objects
  const openingHoursArray = data.openingHours.map((date) => new Date(date));
  const closingHoursArray = data.closingHours.map((date) => new Date(date));

  // Prepare the arrays using Prisma.sql and Prisma.join
  const openingHoursParam = Prisma.sql`ARRAY[${Prisma.join(openingHoursArray.map((date) => Prisma.sql`${date}`))}]::timestamp[]`;

  const closingHoursParam = Prisma.sql`ARRAY[${Prisma.join(closingHoursArray.map((date) => Prisma.sql`${date}`))}]::timestamp[]`;

  // Prepare the geometry parameters
  const geomParam = Prisma.sql`ST_GeomFromText(${data.geom}, 4326)`;
  const pathsParam = Prisma.sql`ST_GeomFromText(${data.paths}, 4326)`;

  // Insert the zone record using a raw SQL query
  const zone = await prisma.$queryRaw`
    INSERT INTO "Zone" (
      name,
      description,
      "openingHours",
      "closingHours",
      geom,
      paths,
      "zoneStatus",
      "parkId"
    )
    VALUES (
      ${data.name},
      ${data.description},
      ${openingHoursParam},
      ${closingHoursParam},
      ${geomParam},
      ${pathsParam},
      ${data.zoneStatus}::"ZONE_STATUS_ENUM",
      ${data.parkId}
    )
    RETURNING
      id,
      name,
      description,
      "openingHours",
      "closingHours",
      ST_AsGeoJSON(geom) AS geom,
      ST_AsGeoJSON(paths) AS paths,
      "zoneStatus",
      "parkId";
  `;

  return zone[0];
}

async function seedFAQs() {
  console.log('Seeding FAQs...');
  const faqList = [];
  for (const faq of faqsData) {
    try {
      const createdFAQ = await prisma.fAQ.create({
        data: faq,
      });
      faqList.push(createdFAQ);
    } catch (error) {
      console.error(`Error creating FAQ: ${error.message}`);
    }
  }
  console.log(`Total FAQs seeded: ${faqList.length}\n`);
}


async function seed() {
  const parks = [];
  for (const park of parksData) {
    const createdPark = await createPark({
      ...park,
      openingHours: park.openingHours.map((time) => new Date(time)),
      closingHours: park.closingHours.map((time) => new Date(time)),
    });
    parks.push(createdPark);
  }
  console.log(`Total parks seeded: ${parks.length}\n`);

  const zones = [];
  for (const zone of zonesData) {
    const createdZone = await createZone(zone);
    zones.push(createdZone);
  }
  console.log(`Total zones seeded: ${zones.length}\n`);

  const speciesList = [];
  for (const species of speciesData) {
    const createdSpecies = await prisma.species.create({
      data: species,
    });
    speciesList.push(createdSpecies);
  }
  console.log(`Total species seeded: ${speciesList.length}\n`);

  const occurrenceList = [];
  for (let i = 0; i < occurrenceData.length; i++) {
    let selectedStatusLogs = [];
    try {
      selectedStatusLogs = getRandomItems(statusLogsData, 2);
    } catch (error) {
      selectedStatusLogs = [];
    }

    const occurrenceCurrent = occurrenceData[i];

    if (i === occurrenceData.length - 1) {
      occurrenceCurrent.speciesId = speciesList[0].id;
    } else {
      // Get the species based on index
      const species = speciesList[i % speciesList.length];
      occurrenceCurrent.speciesId = species.id;
    }

    if (selectedStatusLogs && selectedStatusLogs.length > 1) {
      occurrenceCurrent.occurrenceStatus = selectedStatusLogs[1].statusLogType;
    }

    // Create the occurrence with the correct speciesId and zoneId
    const occurrence = await prisma.occurrence.create({
      data: occurrenceCurrent,
    });
    occurrenceList.push(occurrence);

    // For every Occurrence, create 2 ActivityLogs
    try {
      const selectedActivityLogs = getRandomItems(activityLogsData, 2);
      const activityLogs = selectedActivityLogs.map((log) => ({
        ...log,
        occurrenceId: occurrence.id,
      }));
      await prisma.activityLog.createMany({
        data: activityLogs,
      });
    } catch (error) {
      //
    }

    // For every Occurrence, create 2 StatusLogs
    try {
      const statusLogs = selectedStatusLogs.map((log) => ({
        ...log,
        occurrenceId: occurrence.id,
      }));
      await prisma.statusLog.createMany({
        data: statusLogs,
      });
    } catch (error) {
      //
    }
  }
  console.log(`Total occurrences seeded: ${occurrenceList.length}\n`);

  const staffList = [];
  for (const staff of staffData) {
    const hashedPassword = await bcrypt.hash(staff.password, 10);
    staff.password = hashedPassword;

    const createdStaff = await prisma.staff.create({
      data: staff,
    });
    staffList.push(createdStaff);
  }
  console.log(`Total staff seeded: ${staffList.length}\n`);

  const facilityList = [];
  for (const facility of facilitiesData) {
    const createdFacility = await prisma.facility.create({
      data: facility,
    });
    facilityList.push(createdFacility);
  }
  console.log(`Total facilities seeded: ${facilityList.length}\n`);

  const storeroomId = facilityList[7].id;

  const hubList = [];
  for (const hub of hubsData) {
    hub.facilityId = storeroomId;
    const createdHub = await prisma.hub.create({
      data: hub,
    });
    hubList.push(createdHub);
  }
  console.log(`Total hubs seeded: ${hubList.length}\n`);

  const parkAssetList = [];
  const miniStoreSBG = facilityList[8].id;
  const miniStoreBAMKP = facilityList[9].id;

  for (const parkAsset of parkAssetsData) {
    if (parkAsset.parkAssetType === 'HOSES_AND_PIPES' || parkAsset.name.toLowerCase().includes('cone')) {
      parkAsset.facilityId = miniStoreSBG;
    } else if (parkAsset.name.toLowerCase().includes('saw') || parkAsset.name.toLowerCase().includes('lawnmower')) {
      parkAsset.facilityId = miniStoreBAMKP;
    }
    const createdParkAsset = await prisma.parkAsset.create({
      data: parkAsset,
    });
    parkAssetList.push(createdParkAsset);
  }
  console.log(`Total park assets seeded: ${parkAssetList.length}\n`);

  // Seeding Sensors
  const sensorList = [];
  for (const sensor of sensorsData) {
    sensor.facilityId = storeroomId;
    const createdSensor = await prisma.sensor.create({
      data: sensor,
    });
    sensorList.push(createdSensor);
  }
  console.log(`Total sensors seeded: ${sensorList.length}\n`);

  const amphitheaterId = facilityList[3].id;
  const dragonPlaygroundId = facilityList[6].id;
  const flowerPlaygroundId = facilityList[0].id;

  const eventList = [];
  for (let i = 0; i < eventsData.length; i++) {
    const event = eventsData[i];

    if (i < 3) {
      event.facilityId = amphitheaterId;
    } else if (i < 5) {
      event.facilityId = dragonPlaygroundId;
    } else {
      event.facilityId = flowerPlaygroundId;
    }

    const createdEvent = await prisma.event.create({
      data: event,
    });
    eventList.push(createdEvent);
  }
  console.log(`Total events seeded: ${eventList.length}\n`);

  const attractionList = [];
  for (const attraction of attractionsData) {
    const createdAttraction = await prisma.attraction.create({
      data: attraction,
    });
    attractionList.push(createdAttraction);
  }
  console.log(`Total attractions seeded: ${attractionList.length}\n`);

const plantTasksList = [];
  for (const plantTask of plantTasksData) {
    // Ensure we have valid staff and occurrence data
    if (staffList.length > 0 && occurrenceList.length > 0) {
      const randomStaffIndex = Math.floor(Math.random() * staffList.length);
      const randomOccurrenceIndex = Math.floor(Math.random() * occurrenceList.length);

      const createdPlantTask = await prisma.plantTask.create({
        data: {
          ...plantTask,
          submittingStaff: {
            connect: { id: staffList[randomStaffIndex].id },
          },
          occurrence: {
            connect: { id: occurrenceList[randomOccurrenceIndex].id },
          },
        },
      });
      plantTasksList.push(createdPlantTask);
    } else {
      console.warn('Unable to create plant task: No staff or occurrences available');
    }
  }

  console.log(`Total plant tasks seeded: ${plantTasksList.length}\n`);

  //console.log('Seeding decarbonization areas...');
  const decarbonizationAreaList = [];
  for (const area of decarbonizationAreasData) {
    try {
      const id = uuidv4();
      await prisma.$executeRaw`
        INSERT INTO "DecarbonizationArea" (id, geom, description, name, "parkId")
        VALUES (
          ${id}::uuid,
          ${area.geom},
          ${area.description},
          ${area.name},
          ${area.parkId}
        )
      `;

      // Fetch the inserted data
      const [insertedArea] = await prisma.$queryRaw`
        SELECT id, name, description, geom::text as geom, "parkId"
        FROM "DecarbonizationArea"
        WHERE id = ${id}::uuid
      `;

      decarbonizationAreaList.push(insertedArea);
      //console.log(`Inserted area: ${insertedArea.name}`);
    } catch (error) {
      console.error(`Error inserting decarbonization area: ${area.name}`);
      console.error(error);
    }
  }
  console.log(`Total decarbonization areas seeded: ${decarbonizationAreaList.length}\n`);

  // Now create sequestration histories after all decarbonization areas are created
  console.log('Seeding 14 sequestration histories per decarb area...');

  for (let i = 0; i < decarbonizationAreaList.length; i++) {
    const area = decarbonizationAreaList[i];
    await createSeqHistories(area.id, seqHistoriesData[i], i);
  }

  await seedFAQs();
}

async function createSeqHistories(decarbAreaId, baseSeqHistory, index) {

  const seqHistories = [];

  let currentSeqValue = baseSeqHistory.seqValue;
  const interval = 0.2; // 0.2 kg interval

  // Create entries for 2023 and 2024
  for (let year = 2023; year <= 2024; year++) {
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(baseSeqHistory.date);
      newDate.setFullYear(year);
      newDate.setDate(newDate.getDate() + i);

      try {
        const createdSeqHistory = await prisma.sequestrationHistory.create({
          data: {
            date: newDate,
            seqValue: currentSeqValue,
            decarbonizationAreaId: decarbAreaId
          }
        });
        seqHistories.push(createdSeqHistory);
        currentSeqValue += interval; // Increase by 0.2 kg for the next entry
      } catch (error) {
        console.error(`Error inserting sequestration history for date: ${newDate.toISOString()}`);
        console.error(error);
      }
    }
  }

  console.log(`Total sequestration histories seeded: ${seqHistories.length}\n`);
  /*seqHistories.forEach((history, i) => {
    console.log(`History ${i + 1}:`);
    console.log(`  ID: ${history.id}`);
    console.log(`  Date: ${history.date}`);
    console.log(`  Sequestration Value: ${history.seqValue.toFixed(3)}`);
    console.log(`  Decarbonization Area ID: ${history.decarbonizationAreaId}`);
    console.log('---');
  });*/

  //faq'=

}


// Utility function for Activity Logs and Status Logs
const getRandomItems = (array, count) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
