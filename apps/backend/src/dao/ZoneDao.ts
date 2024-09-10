import { PrismaClient } from "@prisma/client";
import { ZoneCreateData, ZoneResponseData } from "../schemas/zoneSchema";
const prisma = new PrismaClient();

class ZoneDao {
  async createZone(data: ZoneCreateData): Promise<any> {
    await this.initZonesDB();
    const openingHoursArray = data.openingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`);
    const closingHoursArray = data.closingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`);

    const zone = await prisma.$queryRaw`
      INSERT INTO "Zone" (name, description, "openingHours", "closingHours", "geom", "paths", "zoneStatus", "parkId")
      VALUES (
        ${data.name}, 
        ${data.description}, 
        ${openingHoursArray}::timestamp[], 
        ${closingHoursArray}::timestamp[],
        ST_GeomFromText(${data.geom}), 
        ST_LineFromText(${data.paths}, 4326),
        ${data.zoneStatus}::"ZONE_STATUS_ENUM",
        ${data.parkId}
      ) 
      RETURNING id, name, description, "openingHours", "closingHours", ST_AsGeoJSON(geom) as "geom", "zoneStatus", "parkId";
    `;
    return zone[0];
  }

  async initZonesDB(): Promise<void> {
    await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS postgis;`; // puyts in the POSTGIS extension to postgres
    
    await prisma.$queryRaw`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ZONE_STATUS_ENUM') THEN
          CREATE TYPE "ZONE_STATUS_ENUM" AS ENUM ('OPEN', 'CLOSED', 'UNDER_CONSTRUCTION', 'LIMITED_ACCESS');
        END IF;
      END
      $$;
    `;

    // Check if the "Zone" table exists and create it if it doesn't
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

  async getAllZones(): Promise<any[]> {
    await this.initZonesDB();

    // const zones = await prisma.$queryRaw`
    //   SELECT 
    //     id,
    //     name,
    //     description,
    //     "openingHours",
    //     "closingHours",
    //     ST_AsGeoJSON("geom") as geom,
    //     ST_AsGeoJSON("paths") as paths,
    //     "zoneStatus",
    //     "Park".id as "parkId", 
    //   FROM "Zone";
    // `;

    const zones = await prisma.$queryRaw`
    SELECT 
      "Zone".id, 
      "Zone".name, 
      "Zone".description, 
      "Zone"."openingHours", 
      "Zone"."closingHours", 
      ST_AsGeoJSON("Zone".geom) as geom, 
      ST_AsGeoJSON("Zone".paths) as paths, 
      "Zone"."zoneStatus",
      "Park".id as "parkId", 
      "Park".name as "parkName", 
      "Park".description as "parkDescription"
      FROM "Zone"
      LEFT JOIN "Park" ON "Zone"."parkId" = "Park".id;
    `;
    
    if (Array.isArray(zones)) {
      return zones.map(zone => ({
        ...zone,
        geom: JSON.parse(zone.geom),  // Convert GeoJSON string to object
        paths: JSON.parse(zone.paths)  // Convert GeoJSON string to object
      }));
    } else {
      throw new Error("Unable to fetch from database (SQL Error)");
    }
  }

  async getZoneById(id: number): Promise<ZoneResponseData> {
    await this.initZonesDB();

    const zone = await prisma.$queryRaw`
      SELECT 
        "Zone".id, 
        "Zone".name, 
        "Zone".description, 
        "Zone"."openingHours", 
        "Zone"."closingHours", 
        ST_AsGeoJSON("Zone".geom) as geom, 
        ST_AsGeoJSON("Zone".paths) as paths, 
        "Zone"."zoneStatus",
        "Park".id as "parkId", 
        "Park".name as "parkName", 
        "Park".description as "parkDescription"
        FROM "Zone"
        LEFT JOIN "Park" ON "Zone"."parkId" = "Park".id
        WHERE "Zone".id = ${id};
    `;

    if (Array.isArray(zone) && zone.length > 0) {
      const result = zone[0];
      return {
        ...result,
        geom: JSON.parse(result.geom),  // Convert GeoJSON string to object
        paths: JSON.parse(result.paths)  // Convert GeoJSON string to object
      };
    } else {
      throw new Error(`Zone with ID ${id} not found`);
    }
  }

}

export default new ZoneDao();
