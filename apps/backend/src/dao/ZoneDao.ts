import { PrismaClient } from "@prisma/client";
import { ZoneCreateData, ZoneResponseData, ZoneUpdateData } from "../schemas/zoneSchema";
import ParkDao from "./ParkDao";
const prisma = new PrismaClient();

class ZoneDao {
  async createZone(data: ZoneCreateData): Promise<any> {
    await this.initZonesDB();
    const openingHoursArray = data.openingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`);
    const closingHoursArray = data.closingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19).replace('T', ' ')}'`);

    const zone = await prisma.$queryRaw`
      INSERT INTO "Zone" (name, description, "openingHours", "closingHours", "geom", "paths", "zoneStatus", "parkId", images)
      VALUES (
        ${data.name}, 
        ${data.description}, 
        ${openingHoursArray}::timestamp[], 
        ${closingHoursArray}::timestamp[],
        ST_GeomFromText(${data.geom}), 
        ST_LineFromText(${data.paths}, 4326),
        ${data.zoneStatus}::"ZONE_STATUS_ENUM",
        ${data.parkId},
        ${data.images || []}::text[]
      ) 
      RETURNING id, name, description, "openingHours", "closingHours", ST_AsGeoJSON(geom) as "geom", "zoneStatus", "parkId", images;
    `;
    return zone[0];
  }

  async initZonesDB(): Promise<void> {
    await ParkDao.initParksDB();
    
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
        "parkId" INT REFERENCES "Park"(id) ON DELETE CASCADE,
        images TEXT[]
      );
    `;

    // Add the "images" column if it doesn't exist
    await prisma.$queryRaw`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'Zone' AND column_name = 'images'
        ) THEN
          ALTER TABLE "Zone" ADD COLUMN images TEXT[];
        END IF;
      END $$;
    `;
  }

  async getAllZones(): Promise<any[]> {
    await this.initZonesDB();

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
        "Zone".images,
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
        "Zone".images,
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

  async getZonesByParkId(parkId: number): Promise<ZoneResponseData[]> {
    await this.initZonesDB();

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
      "Zone".images
    FROM "Zone"
    WHERE "Zone"."parkId" = ${parkId};
    `;

    if (Array.isArray(zones)) {
      return zones.map(zone => ({
        ...zone,
        geom: JSON.parse(zone.geom),  
        paths: JSON.parse(zone.paths),
        parkId: parkId  
      }));
    } else {
      throw new Error(`Zone with Park ID ${parkId} not found`);
    }
  }

  async deleteZoneById(id: number): Promise<void> {
    await this.initZonesDB();
    
    const deletedZone = await prisma.$executeRaw`
      DELETE FROM "Zone"
      WHERE id = ${id};
    `;
    
    if (deletedZone === 0) {
      throw new Error(`Zone with ID ${id} not found`);
    }
  }

  async updateZone(id: number, data: Partial<ZoneUpdateData>): Promise<ZoneResponseData> {
    await this.initZonesDB();

    const updates: string[] = [];
    const values: any[] = [];

    // Dynamically build the query for each field if it's provided
    if (data.name) {
      updates.push(`name = $${updates.length + 1}`);
      values.push(data.name);
    }

    if (data.description) {
      updates.push(`description = $${updates.length + 1}`);
      values.push(data.description);
    }

    if (data.openingHours) {
      updates.push(`"openingHours" = $${updates.length + 1}::timestamp[]`);
      const openingHoursArray = data.openingHours.map(d => new Date(d).toISOString().slice(0, 19).replace('T', ' '));
      values.push(openingHoursArray);
    }

    if (data.closingHours) {
      updates.push(`"closingHours" = $${updates.length + 1}::timestamp[]`);
      const closingHoursArray = data.closingHours.map(d => new Date(d).toISOString().slice(0, 19).replace('T', ' '));
      values.push(closingHoursArray);
    }

    if (data.geom) {
      updates.push(`geom = ST_GeomFromText($${updates.length + 1})`);
      values.push(data.geom);
    }

    if (data.paths) {
      updates.push(`paths = ST_LineFromText($${updates.length + 1}, 4326)`);
      values.push(data.paths);
    }

    if (data.zoneStatus) {
      updates.push(`"zoneStatus" = $${updates.length + 1}::"ZONE_STATUS_ENUM"`);
      values.push(data.zoneStatus);
    }

    if (data.parkId) {
      updates.push(`"parkId" = $${updates.length + 1}`);
      values.push(data.parkId);
    }

    if (data.images) {
      updates.push(`images = $${updates.length + 1}::text[]`);
      values.push(data.images);
    }

    // Check if there are updates to be made
    if (updates.length === 0) {
      throw new Error('No attributes provided for update');
    }

    // Build the final SQL query
    const query = `
      UPDATE "Zone"
      SET ${updates.join(', ')}
      WHERE id = $${updates.length + 1}
      RETURNING id, name, description, "openingHours", "closingHours", ST_AsGeoJSON(geom) as geom, ST_AsGeoJSON(paths) as paths, "zoneStatus", "parkId", images;
    `;

    // Add the id to the list of values
    values.push(id);

    // Execute the query with parameterized values
    const updatedZone = await prisma.$queryRawUnsafe(query, ...values);

    if (Array.isArray(updatedZone) && updatedZone.length > 0) {
      const result = updatedZone[0];
      return {
        ...result,
        geom: JSON.parse(result.geom),
        paths: JSON.parse(result.paths)
      };
    } else {
      throw new Error(`Unable to update zone with ID ${id}`);
    }
  }
}

export default new ZoneDao();
