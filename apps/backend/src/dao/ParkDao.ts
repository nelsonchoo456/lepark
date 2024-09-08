import { PrismaClient } from "@prisma/client";
import { ParkCreateData } from "../schemas/parkSchema";
const prisma = new PrismaClient();

class ParkDao {
  async createPark(data: ParkCreateData): Promise<any> {
    await this.initParksDB();
    const openingHoursFormat = formatDatesArray(data.openingHours);
    const closingHoursFormat = formatDatesArray(data.closingHours);

    const openingHoursArray = data.openingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`);
    const closingHoursArray = data.closingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`);

    const park = await prisma.$queryRaw`
      INSERT INTO "Park" (name, description, "address", "contactNumber", "openingHours", "closingHours", "geom", "paths", "parkStatus")
      VALUES (
        ${data.name}, 
        ${data.description}, 
        ${data.address},
        ${data.contactNumber},
        -- ${openingHoursFormat}, 
        -- ${closingHoursFormat},
        -- array[${data.openingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`)}]::timestamp[], 
        -- array[${data.closingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`)}]::timestamp[], 
        ${openingHoursArray}::timestamp[], 
        ${closingHoursArray}::timestamp[],
        -- ARRAY[${openingHoursArray.join(', ')}]::timestamp[], 
        -- ARRAY[${closingHoursArray.join(', ')}]::timestamp[], 
        -- ${prisma.$queryRaw`ARRAY[${data.openingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`)}]::timestamp[]`}, 
        -- ${prisma.$queryRaw`ARRAY[${data.closingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`)}]::timestamp[]`}, 
        ST_GeomFromText(${data.geom}), 
        ST_LineFromText(${data.paths}, 4326),
        ${data.parkStatus}::"PARK_STATUS_ENUM"
      ) 
      RETURNING id, name, description, "address", "contactNumber", "openingHours", "closingHours", ST_AsGeoJSON(geom) as "geom", "parkStatus";
    `;
    return park[0];
  }

  async initParksDB(): Promise<void> {
    await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS postgis;`;
    
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
        geom GEOMETRY,
        paths GEOMETRY,
        "parkStatus" "PARK_STATUS_ENUM"
      );
    `;
  }

  async getAllParks(): Promise<any[]> {
    await this.initParksDB();

    const parks = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        description,
        "address", 
        "contactNumber",
        "openingHours",
        "closingHours",
        ST_AsGeoJSON("geom") as geom,
        ST_AsGeoJSON("paths") as paths,
        "parkStatus"
      FROM "Park";
    `;
    
    if (Array.isArray(parks)) {
      return parks.map(park => ({
        ...park,
        geom: JSON.parse(park.geom),  // Convert GeoJSON string to object
        paths: JSON.parse(park.paths)  // Convert GeoJSON string to object
      }));
    } else {
      throw new Error("Unable to fetch from database (SQL Error)");
    }
  }

  // async getParkById(id: number): Promise<Park> {
  //   return prisma.park.findUnique({ where: { id } });
  // }
}

const formatDatesArray = (datesArray: Date[]) => {
  // Convert the date array into the desired format YYYY-MM-DD HH:MM:SS
  const formattedDates = datesArray.map(date => {
    const parsedDate = new Date(date);
    return parsedDate.toISOString().slice(0, 19).replace('T', ' '); // Replace 'T' with a space to get the correct format
  });

  // Join the dates into a single string and wrap it with curly braces
  return `'{${formattedDates.join(', ')}}'`;
}

export default new ParkDao();