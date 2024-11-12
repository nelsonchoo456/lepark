import { PrismaClient } from '@prisma/client';
import { ParkCreateData, ParkResponseData, ParkUpdateData } from '../schemas/parkSchema';
const prisma = new PrismaClient();

class ParkDao {
  public async createPark(data: ParkCreateData): Promise<ParkResponseData> {
    await this.initParksDB();
    const openingHoursArray = data.openingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19)}'`);
    const closingHoursArray = data.closingHours.map((d) => `'${new Date(d).toISOString().slice(0, 19)}'`);

    const park = await prisma.$queryRaw`
      INSERT INTO "Park" (name, description, "address", "contactNumber", "openingHours", "closingHours", "images", "geom", "paths", "parkStatus")
      VALUES (
        ${data.name}, 
        ${data.description}, 
        ${data.address},
        ${data.contactNumber},
        ${openingHoursArray}::timestamp[], 
        ${closingHoursArray}::timestamp[],
        ${data.images}::text[],
        ST_GeomFromText(${data.geom}), 
        ST_LineFromText(${data.paths}, 4326),
        
        ${data.parkStatus}::"ParkStatusEnum"
      ) 
      RETURNING id, name, description, "address", "contactNumber", "openingHours", "closingHours", "images", ST_AsGeoJSON(geom) as "geom", "parkStatus";
    `;
    return park[0];
  }

  public async initParksDB(): Promise<void> {
    await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS postgis;`; // puyts in the POSTGIS extension to postgres

    await prisma.$queryRaw`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ParkStatusEnum') THEN
          CREATE TYPE "ParkStatusEnum" AS ENUM ('OPEN', 'CLOSED', 'UNDER_CONSTRUCTION', 'LIMITED_ACCESS');
        END IF;
      END
      $$;
    `;

    // Check if the "Park" table exists and create it if it doesn't
    await prisma.$queryRaw`
      CREATE TABLE IF NOT EXISTS "Park" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        address TEXT,
        "contactNumber" TEXT,
        "openingHours" TIMESTAMP[],
        "closingHours" TIMESTAMP[],
        images TEXT[],
        geom GEOMETRY,
        paths GEOMETRY,
        "parkStatus" "ParkStatusEnum"
      );
    `;
  }

  public async getAllParks(): Promise<ParkResponseData[]> {
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
        "images", 
        ST_AsGeoJSON("geom") as geom,
        ST_AsGeoJSON("paths") as paths,
        "parkStatus"
      FROM "Park";
    `;

    if (Array.isArray(parks)) {
      return parks.map((park) => ({
        ...park,
        geom: JSON.parse(park.geom), // Convert GeoJSON string to object
        paths: JSON.parse(park.paths), // Convert GeoJSON string to object
      }));
    } else {
      throw new Error('Unable to fetch from database (SQL Error)');
    }
  }

  public async getParkById(id: number): Promise<ParkResponseData> {
    await this.initParksDB();

    const park = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        description,
        "address", 
        "contactNumber",
        "openingHours",
        "closingHours",
        "images", 
        ST_AsGeoJSON("geom") as geom,
        ST_AsGeoJSON("paths") as paths,
        "parkStatus"
      FROM "Park"
      WHERE id = ${id};
    `;

    if (Array.isArray(park) && park.length > 0) {
      const result = park[0];
      return {
        ...result,
        geom: JSON.parse(result.geom), // Convert GeoJSON string to object
        paths: JSON.parse(result.paths), // Convert GeoJSON string to object
      };
    } else {
      throw new Error(`Park with ID ${id} not found`);
    }
  }

  public async updatePark(id: number, data: Partial<ParkUpdateData>): Promise<ParkResponseData> {
    await this.initParksDB();

    // If the name is being updated, check if it already exists
    if (data.name) {
      const existingPark = await this.getParkByName(data.name);
      if (existingPark && existingPark.id !== id.toString()) {
        throw new Error('A park with this name already exists');
      }
    }

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

    if (data.address) {
      updates.push(`"address" = $${updates.length + 1}`);
      values.push(data.address);
    }

    if (data.contactNumber) {
      updates.push(`"contactNumber" = $${updates.length + 1}`);
      values.push(data.contactNumber);
    }

    if (data.openingHours) {
      updates.push(`"openingHours" = $${updates.length + 1}::timestamp[]`);
      const openingHoursArray = data.openingHours.map((d) => new Date(d).toISOString().slice(0, 19).replace('T', ' '));
      values.push(openingHoursArray);
    }

    if (data.closingHours) {
      updates.push(`"closingHours" = $${updates.length + 1}::timestamp[]`);
      const closingHoursArray = data.closingHours.map((d) => new Date(d).toISOString().slice(0, 19).replace('T', ' '));
      values.push(closingHoursArray);
    }

    if (data.images) {
      updates.push(`images = $${updates.length + 1}::text[]`);
      values.push(data.images);
    }

    if (data.geom) {
      updates.push(`geom = ST_GeomFromText($${updates.length + 1})`);
      values.push(data.geom);
    }

    if (data.paths) {
      updates.push(`paths = ST_LineFromText($${updates.length + 1}, 4326)`);
      values.push(data.paths);
    }

    if (data.parkStatus) {
      updates.push(`"parkStatus" = $${updates.length + 1}::"ParkStatusEnum"`);
      values.push(data.parkStatus);
    }

    // Check if there are updates to be made
    if (updates.length === 0) {
      throw new Error('No attributes provided for update');
    }

    // Build the final SQL query
    const query = `
      UPDATE "Park"
      SET ${updates.join(', ')}
      WHERE id = $${updates.length + 1}
      RETURNING id, name, description, address, "contactNumber", "openingHours", "closingHours", "images", ST_AsGeoJSON(geom) as geom, ST_AsGeoJSON(paths) as paths, "parkStatus";
    `;

    // Add the id to the list of values
    values.push(id);

    // Execute the query with parameterized values
    const updatedPark = await prisma.$queryRawUnsafe(query, ...values);

    if (Array.isArray(updatedPark) && updatedPark.length > 0) {
      const result = updatedPark[0];
      return {
        ...result,
        geom: JSON.parse(result.geom), // Convert GeoJSON string to object
        paths: JSON.parse(result.paths), // Convert GeoJSON string to object
      };
    } else {
      throw new Error(`Unable to update park with ID ${id}`);
    }
  }

  public async deleteParkById(id: number): Promise<void> {
    await this.initParksDB();

    const deletedPark = await prisma.$executeRaw`
      DELETE FROM "Park"
      WHERE id = ${id};
    `;

    if (deletedPark === 0) {
      throw new Error(`Park with ID ${id} not found`);
    }
  }

  public async getRandomParkImage(): Promise<string[]> {
    // Fetch all parks
    const parks: { images: string[] | null }[] = await prisma.$queryRaw`
      SELECT images FROM "Park";
    `;

    // Collect all images into a single array
    const allImages: string[] = parks.flatMap((park: { images: string[] }) => park.images || []);

    // If there are no images, return an empty array
    if (allImages.length === 0) {
      return [];
    }

    // Return a random image wrapped in an array
    const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
    return [randomImage];
  }

  public async getParkByName(name: string): Promise<ParkResponseData | null> {
    await this.initParksDB();

    const park = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        description,
        "address", 
        "contactNumber",
        "openingHours",
        "closingHours",
        "images", 
        ST_AsGeoJSON("geom") as geom,
        ST_AsGeoJSON("paths") as paths,
        "parkStatus"
      FROM "Park"
      WHERE name = ${name};
    `;

    if (Array.isArray(park) && park.length > 0) {
      const result = park[0];
      return {
        ...result,
        geom: JSON.parse(result.geom),
        paths: JSON.parse(result.paths),
      };
    } else {
      return null;
    }
  }
}

export default new ParkDao();
