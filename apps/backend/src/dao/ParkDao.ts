import { PrismaClient } from "@prisma/client";
import { ParkCreateData } from "../schemas/parkSchema";
const prisma = new PrismaClient();

class ParkDao {
  async createPark(data: ParkCreateData): Promise<any> {
    await this.initParksDB();
    const openingHoursFormat = data.openingHours.map((d) => new Date(d).toISOString().slice(0, 19).replace('T', ' '));
    const closingHoursFormat = data.closingHours.map((d) => new Date(d).toISOString().slice(0, 19).replace('T', ' '));

    const park = await prisma.$queryRaw`
      INSERT INTO "Park" (name, description, "openingHours", "closingHours", "geom", "paths", "parkStatus")
      VALUES (
        ${data.name}, 
        ${data.description}, 
        '{2024-09-08 06:00:00, 2024-09-09 06:00:00, 2024-09-10 06:00:00}', 
        '{2024-09-08 06:00:00, 2024-09-09 06:00:00, 2024-09-10 06:00:00}',
        ST_GeomFromText(${data.geom}), 
        ST_LineFromText(${data.paths}, 4326),
        ${data.parkStatus}::"PARK_STATUS_ENUM"
      ) 
      RETURNING *;
    `;
    return park;
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

export default new ParkDao();