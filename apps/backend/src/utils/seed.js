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
  attractionTicketListingsData,
  decarbonizationAreasData,
  plantTasksData,
  maintenanceTasksData,
  sensorReadingsData,
  newHubs,
  newSensors,
  seqHistoriesData,
  faqsData,
  visitorsData,
  promotionsData,
  announcementsData,
  attractionTransactionLocalData,
  attractionTransactionStandardData,
  eventTicketListingsData,
  eventTransactionLocalData,
  eventTransactionStandardData,
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

  const openingHoursArray = data.openingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19)}'`);
  const closingHoursArray = data.closingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19)}'`);

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
      ${openingHoursArray}::timestamp[], 
      ${closingHoursArray}::timestamp[],
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

  const openingHoursArray = data.openingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19)}'`);
  const closingHoursArray = data.closingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19)}'`);

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
      ${openingHoursArray}::timestamp[], 
      ${closingHoursArray}::timestamp[],
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

  const eventTicketListingsList = [];

  for (const event of eventList) {
    const currentListings = [];
    for (const listing of eventTicketListingsData) {
      listing.eventId = event.id;
      const eventListing = await prisma.eventTicketListing.create({
        data: listing,
      });
      currentListings.push(eventListing);
    }
    eventTicketListingsList.push(currentListings);
  }
  console.log(`Total events (with listings) seeded: ${eventList.length}\n`);

  const attractionList = [];
  for (const attraction of attractionsData) {
    const createdAttraction = await prisma.attraction.create({
      data: attraction,
    });
    attractionList.push(createdAttraction);
  }

  const attractionTicketListingsList = [];

  for (const attraction of attractionList) {
    const currentListings = [];
    for (const listing of attractionTicketListingsData) {
      listing.attractionId = attraction.id;
      const attractionListing = await prisma.attractionTicketListing.create({
        data: listing,
      });
      currentListings.push(attractionListing);
    }
    attractionTicketListingsList.push(currentListings);
  }
  console.log(`Total attractions (with listings) seeded: ${attractionList.length}\n`);

  const maintenanceTasksList = [];
  for (const maintenanceTask of maintenanceTasksData) {
    // Filter staff from Park Id 2
    const parkId2Staff = staffList.filter((staff) => staff.parkId === 2);

    // Filter staff with MANAGER or SUPERADMIN roles from Park Id 2 for submitting
    const eligibleSubmittingStaff = parkId2Staff.filter((staff) => staff.role === 'MANAGER' || staff.role === 'VENDOR_MANAGER');

    // Filter staff with appropriate roles for assignment
    const eligibleAssignedStaff = parkId2Staff.filter((staff) => ['VENDOR_MANAGER'].includes(staff.role));

    // Ensure we have valid staff data
    if (parkId2Staff.length > 0 && eligibleAssignedStaff.length > 0) {
      const randomSubmittingStaffIndex = Math.floor(Math.random() * eligibleSubmittingStaff.length);
      // const randomAssignedStaffIndex = Math.floor(Math.random() * eligibleAssignedStaff.length);

      // Determine which entity to associate with the task
      let entityConnection = {};
      if (maintenanceTask.title.includes('Bench') || maintenanceTask.title.includes('Restroom')) {
        const randomFacilityIndex = Math.floor(Math.random() * facilityList.length);
        entityConnection = { facility: { connect: { id: facilityList[randomFacilityIndex].id } } };
      } else if (maintenanceTask.title.includes('Sensor')) {
        const randomSensorIndex = Math.floor(Math.random() * sensorList.length);
        entityConnection = { sensor: { connect: { id: sensorList[randomSensorIndex].id } } };
      } else if (maintenanceTask.title.includes('Hub')) {
        const randomHubIndex = Math.floor(Math.random() * hubList.length);
        entityConnection = { hub: { connect: { id: hubList[randomHubIndex].id } } };
      } else if (maintenanceTask.title.includes('Lawnmower')) {
        const randomParkAssetIndex = Math.floor(Math.random() * parkAssetList.length);
        entityConnection = { parkAsset: { connect: { id: parkAssetList[randomParkAssetIndex].id } } };
      }

      const createdMaintenanceTask = await prisma.maintenanceTask.create({
        data: {
          ...maintenanceTask,
          createdAt: maintenanceTask.createdAt,
          submittingStaff: {
            connect: { id: eligibleSubmittingStaff[randomSubmittingStaffIndex].id },
          },
          // assignedStaff: {
          //   connect: { id: eligibleAssignedStaff[randomAssignedStaffIndex].id },
          // },
          ...entityConnection,
        },
      });
      maintenanceTasksList.push(createdMaintenanceTask);
    } else {
      console.warn('Unable to create maintenance task: No eligible staff available for Park Id 2');
    }
  }

  console.log(`Total maintenance tasks seeded: ${maintenanceTasksList.length}\n`);

  const plantTasksList = [];
  for (const plantTask of plantTasksData) {
    // Filter staff from Park Id 2
    const parkId2Staff = staffList.filter((staff) => staff.parkId === 2);

    // Filter staff with ARBORIST or BOTANIST roles from Park Id 2
    const eligibleAssignedStaff = parkId2Staff.filter((staff) => staff.role === 'ARBORIST' || staff.role === 'BOTANIST');

    const eligibleSubmittingStaff = parkId2Staff.filter(
      (staff) => staff.role === 'ARBORIST' || staff.role === 'BOTANIST' || staff.role === 'SUPERADMIN' || staff.role === 'MANAGER',
    );

    // Filter occurrences from Park Id 2
    const parkId2Occurrences = occurrenceList.filter((occurrence) => occurrence.zoneId && occurrence.zoneId === 2);

    // Ensure we have valid staff and occurrence data
    if (parkId2Staff.length > 0 && eligibleAssignedStaff.length > 0 && parkId2Occurrences.length > 0) {
      const randomSubmittingStaffIndex = Math.floor(Math.random() * eligibleSubmittingStaff.length);
      const randomAssignedStaffIndex = Math.floor(Math.random() * eligibleAssignedStaff.length);
      const randomOccurrenceIndex = Math.floor(Math.random() * parkId2Occurrences.length);

      const createdPlantTask = await prisma.plantTask.create({
        data: {
          ...plantTask,
          createdAt: plantTask.createdAt, // Use the createdAt from the mock data
          submittingStaff: {
            connect: { id: parkId2Staff[randomSubmittingStaffIndex].id },
          },
          assignedStaff: {
            connect: { id: eligibleAssignedStaff[randomAssignedStaffIndex].id },
          },
          occurrence: {
            connect: { id: parkId2Occurrences[randomOccurrenceIndex].id },
          },
        },
      });
      plantTasksList.push(createdPlantTask);
    } else {
      console.warn('Unable to create plant task: No eligible staff or occurrences available for Park Id 2');
    }
  }

  console.log(`Total plant tasks seeded: ${plantTasksList.length}\n`);

  // Create the new hub
  let createdNewHubs = [];
  for (const newHub of newHubs) {
    const createdNewHub = await prisma.hub.create({
      data: {
        ...newHub,
        facilityId: storeroomId, // or any other appropriate facilityId
      },
    });
    createdNewHubs.push(createdNewHub);
    console.log(`New hub created: ${createdNewHub.name}\n`);
  }

  // Create new sensors and associate them with the new hub
  let count = 0;
  for (const sensor of newSensors) {
    if (count < 5) {
      const createdSensor = await prisma.sensor.create({
        data: {
          ...sensor,
          hubId: createdNewHubs[0].id,
          facilityId: storeroomId, // or any other appropriate facilityId
        },
      });
      sensorList.push(createdSensor);
    } else {
      const createdSensor = await prisma.sensor.create({
        data: {
          ...sensor,
          hubId: createdNewHubs[1].id,
          facilityId: storeroomId, // or any other appropriate facilityId
        },
      });
      sensorList.push(createdSensor);
    }
    count++;
  }
  console.log(`New sensors created and associated with the new hub: ${newSensors.length}\n`);

  // Generate and create sensor readings for all sensors
  for (const sensor of sensorList.filter((sensor) => sensor.sensorStatus === 'ACTIVE')) {
    const readings = generateMockReadings(sensor.sensorType).map((reading) => ({
      ...reading,
      sensorId: sensor.id,
    }));

    await prisma.sensorReading.createMany({
      data: readings,
    });
  }
  console.log(`Sensor readings created for all new sensors that are linked to the new hub\n`);

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

  //const areaNames = ['PVN', 'East Area', 'West Area', 'PVC', 'PVS'];
  for (let i = 0; i < decarbonizationAreaList.length; i++) {
    const area = decarbonizationAreaList[i];
    //console.log(`Seeding sequestration history for ${areaNames[i]}...`);
    await createSeqHistories(area.id, seqHistoriesData[i], i);
  }

  await seedFAQs();

  const visitorList = [];
  for (const visitor of visitorsData) {
    const hashedPassword = await bcrypt.hash(visitor.password, 10);
    visitor.password = hashedPassword;

    const createdVisitor = await prisma.visitor.create({
      data: visitor,
    });
    visitorList.push(createdVisitor);
  }
  console.log(`Total visitors seeded: ${visitorList.length}\n`);

  const promotionList = [];
  for (const promotion of promotionsData) {
    const createdPromotion = await prisma.promotion.create({
      data: promotion,
    });
    promotionList.push(createdPromotion);
  }
  console.log(`Total promotions seeded: ${promotionList.length}\n`);

  const announcementList = [];
  for (const announcement of announcementsData) {
    const createdAnnouncement = await prisma.announcement.create({
      data: announcement,
    });
    announcementList.push(createdAnnouncement);
  }
  console.log(`Total announcements seeded: ${announcementList.length}\n`);

  const transactionList = [];
  const aaronId = visitorList[1].id;
  const flowerDomeId = attractionList[2].id;
  const flowerDomeListings = attractionTicketListingsList[2];
  for (const transaction of attractionTransactionLocalData) {
    transaction.visitorId = aaronId;
    transaction.attractionId = flowerDomeId;

    for (let i = 0; i < transaction.tickets.length; i++) {
      transaction.tickets[i].listingId = flowerDomeListings[i].id;
    }

    const { tickets, ...transactionData } = transaction;

    const result = await prisma.$transaction(async (prismaClient) => {
      // Fetch all required listings in one query
      const listingIds = tickets.map((ticket) => ticket.listingId);
      const listings = await prismaClient.attractionTicketListing.findMany({
        where: { id: { in: listingIds } },
      });

      // Create a map for quick price lookup
      const listingPriceMap = new Map(listings.map((listing) => [listing.id, listing.price]));

      // Create the transaction
      const createdTransaction = await prismaClient.attractionTicketTransaction.create({
        data: {
          ...transactionData,
          attractionTickets: {
            create: tickets.flatMap((ticket) => {
              const price = listingPriceMap.get(ticket.listingId);
              if (price === undefined) {
                throw new Error(`Price not found for listing ID: ${ticket.listingId}`);
              }
              return Array(ticket.quantity).fill({
                price: price,
                status: 'VALID',
                attractionTicketListingId: ticket.listingId,
              });
            }),
          },
        },
        include: {
          attractionTickets: true,
        },
      });

      return createdTransaction;
    });

    transactionList.push(result);
  }

  for (const transaction of attractionTransactionStandardData) {
    transaction.visitorId = aaronId;
    transaction.attractionId = flowerDomeId;

    for (let i = 0; i < transaction.tickets.length; i++) {
      transaction.tickets[i].listingId = flowerDomeListings[i + 4].id;
    }

    const { tickets, ...transactionData } = transaction;

    const result = await prisma.$transaction(async (prismaClient) => {
      // Fetch all required listings in one query
      const listingIds = tickets.map((ticket) => ticket.listingId);
      const listings = await prismaClient.attractionTicketListing.findMany({
        where: { id: { in: listingIds } },
      });

      // Create a map for quick price lookup
      const listingPriceMap = new Map(listings.map((listing) => [listing.id, listing.price]));

      // Create the transaction
      const createdTransaction = await prismaClient.attractionTicketTransaction.create({
        data: {
          ...transactionData,
          attractionTickets: {
            create: tickets.flatMap((ticket) => {
              const price = listingPriceMap.get(ticket.listingId);
              if (price === undefined) {
                throw new Error(`Price not found for listing ID: ${ticket.listingId}`);
              }
              return Array(ticket.quantity).fill({
                price: price,
                status: 'VALID',
                attractionTicketListingId: ticket.listingId,
              });
            }),
          },
        },
        include: {
          attractionTickets: true,
        },
      });

      return createdTransaction;
    });

    transactionList.push(result);
  }

  console.log(`Total attraction transactions seeded: ${transactionList.length}\n`);

  const eventTransactionList = [];
  const wildlifeTalkEventId = eventList[0].id;
  const wildlifeTalkEventListings = eventTicketListingsList[0];

  for (const transaction of eventTransactionLocalData) {
    transaction.visitorId = aaronId;
    transaction.eventId = wildlifeTalkEventId;

    for (let i = 0; i < transaction.tickets.length; i++) {
      transaction.tickets[i].listingId = wildlifeTalkEventListings[i].id;
    }

    const { tickets, ...transactionData } = transaction;

    const result = await prisma.$transaction(async (prismaClient) => {
      // Fetch all required listings in one query
      const listingIds = tickets.map((ticket) => ticket.listingId);
      const listings = await prismaClient.eventTicketListing.findMany({
        where: { id: { in: listingIds } },
      });

      // Create a map for quick price lookup
      const listingPriceMap = new Map(listings.map((listing) => [listing.id, listing.price]));

      // Create the transaction
      const createdTransaction = await prismaClient.eventTicketTransaction.create({
        data: {
          ...transactionData,
          eventTickets: {
            create: tickets.flatMap((ticket) => {
              const price = listingPriceMap.get(ticket.listingId);
              if (price === undefined) {
                throw new Error(`Price not found for listing ID: ${ticket.listingId}`);
              }
              return Array(ticket.quantity).fill({
                price: price,
                status: 'VALID',
                eventTicketListingId: ticket.listingId,
              });
            }),
          },
        },
        include: {
          eventTickets: true,
        },
      });

      return createdTransaction;
    });

    eventTransactionList.push(result);
  }

  for (const transaction of eventTransactionStandardData) {
    transaction.visitorId = aaronId;
    transaction.eventId = wildlifeTalkEventId;

    for (let i = 0; i < transaction.tickets.length; i++) {
      transaction.tickets[i].listingId = wildlifeTalkEventListings[i + 4].id;
    }

    const { tickets, ...transactionData } = transaction;

    const result = await prisma.$transaction(async (prismaClient) => {
      // Fetch all required listings in one query
      const listingIds = tickets.map((ticket) => ticket.listingId);
      const listings = await prismaClient.eventTicketListing.findMany({
        where: { id: { in: listingIds } },
      });

      // Create a map for quick price lookup
      const listingPriceMap = new Map(listings.map((listing) => [listing.id, listing.price]));

      // Create the transaction
      const createdTransaction = await prismaClient.eventTicketTransaction.create({
        data: {
          ...transactionData,
          eventTickets: {
            create: tickets.flatMap((ticket) => {
              const price = listingPriceMap.get(ticket.listingId);
              if (price === undefined) {
                throw new Error(`Price not found for listing ID: ${ticket.listingId}`);
              }
              return Array(ticket.quantity).fill({
                price: price,
                status: 'VALID',
                eventTicketListingId: ticket.listingId,
              });
            }),
          },
        },
        include: {
          eventTickets: true,
        },
      });

      return createdTransaction;
    });

    eventTransactionList.push(result);
  }

  console.log(`Total event transactions seeded: ${eventTransactionList.length}\n`);
}

async function createSeqHistories(decarbAreaId, baseSeqHistory, index) {
  const seqHistories = [];
  const startDate = new Date('2023-12-01');
  const endDate = new Date('2024-10-23');
  const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // +1 to include the end date

  const startValues = [21.25, 557, 426.5, 484.25, 38.5]; // Starting values for PVN, East Area, West Area, PVC, PVS
  const endValues = [146, 4100, 2029, 1142, 189]; // Corrected final values for PVN, East Area, West Area, PVC, PVS

  const dailyIncrease = (endValues[index] - startValues[index]) / (daysDiff - 1);

  let currentDate = new Date(startDate);
  let currentSeqValue = startValues[index];

  while (currentDate <= endDate) {
    try {
      const createdSeqHistory = await prisma.sequestrationHistory.create({
        data: {
          date: new Date(currentDate),
          seqValue: parseFloat(currentSeqValue.toFixed(3)),
          decarbonizationAreaId: decarbAreaId,
        },
      });
      seqHistories.push(createdSeqHistory);
      currentSeqValue += dailyIncrease;
    } catch (error) {
      console.error(`Error inserting sequestration history for date: ${currentDate.toISOString()}`);
      console.error(error);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`Total sequestration histories seeded for area ${index + 1}: ${seqHistories.length}`);
}

// Utility function for Activity Logs and Status Logs
const getRandomItems = (array, count) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate mock sensor readings
const generateMockReadings = (sensorType) => {
  const readings = [];
  const now = new Date();
  const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

  // Generate readings every 15 minutes from now till 8 hours ago
  for (let time = now; time >= eightHoursAgo; time = new Date(time.getTime() - 15 * 60 * 1000)) {
    readings.push(createReading(sensorType, time));
  }

  return readings.sort((a, b) => b.date - a.date); // Sort by date, most recent first
};

const createReading = (sensorType, date) => {
  const hour = date.getHours();
  let value;

  switch (sensorType) {
    case 'SOIL_MOISTURE':
      // Simulate watering at 6 AM and 6 PM
      if (hour === 6 || hour === 18) {
        value = 70 + Math.random() * 10; // 70-80%
      } else if (hour >= 12 && hour <= 16) {
        // Greater decrease from 12 PM to 4 PM
        const hoursFrom12 = hour - 12;
        value = 65 - hoursFrom12 * 4 + Math.random() * 5; // Steeper decline
      } else {
        // Gradual decrease in moisture for other hours
        value = 70 - (Math.abs(hour - 6) % 12) * 2 + Math.random() * 5;
      }
      break;
    case 'TEMPERATURE':
      // Simulate daily temperature cycle
      value = 22 + Math.sin(((hour - 6) * Math.PI) / 12) * 5 + Math.random() * 2;
      break;
    case 'HUMIDITY':
      // Inverse relationship with temperature
      value = 70 - Math.sin(((hour - 6) * Math.PI) / 12) * 10 + Math.random() * 5;
      break;
    case 'LIGHT':
      if (hour >= 6 && hour < 18) {
        // Daylight hours
        value = Math.sin(((hour - 6) * Math.PI) / 12) * 200 + Math.random() * 50;
      } else {
        // Night time
        value = Math.random() * 5; // Very low light at night
      }
      break;
    case 'CAMERA':
      value = Math.random() * 50; // 0 to 50
      return {
        date,
        value: parseFloat(value.toFixed(0)),
      };
    default:
      value = Math.random() * 100;
  }

  return {
    date,
    value: parseFloat(value.toFixed(2)),
  };
};

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
