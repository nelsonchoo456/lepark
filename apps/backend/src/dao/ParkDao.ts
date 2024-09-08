import { Park, PrismaClient } from "@prisma/client";
import { ParkCreateData } from "../schemas/parkSchema";
import { query } from "../config/db";
const prisma = new PrismaClient();

class ParkDao {
  async createPark(data: ParkCreateData): Promise<any> {
    

    const openingHoursFormat = data.openingHours.map((d) => new Date(d).toISOString().slice(0, 19).replace('T', ' '));
    const closingHoursFormat = data.closingHours.map((d) => new Date(d).toISOString().slice(0, 19).replace('T', ' '));

    console.log(openingHoursFormat)
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

  async getAllParks(): Promise<Park[]> {
    return prisma.park.findMany();
  }

  async getParkById(id: string): Promise<Park> {
    return prisma.park.findUnique({ where: { id } });
  }
}

export default new ParkDao();