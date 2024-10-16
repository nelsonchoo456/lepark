import { PrismaClient, Prisma, Announcement } from '@prisma/client';

const prisma = new PrismaClient();

class AnnouncementDao {
  async createAnnouncement(data: Prisma.AnnouncementCreateInput): Promise<Announcement> {
    return prisma.announcement.create({ data });
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return prisma.announcement.findMany();
  }

  async getAnnouncementsByParkId(parkId: number): Promise<Announcement[]> {
    return prisma.announcement.findMany({ where: { parkId } });
  }

  async getNParksAnnouncements(): Promise<Announcement[]> {
    return prisma.announcement.findMany({ where: { parkId: null } });
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    return prisma.announcement.findUnique({ where: { id } });
  }

  async updateAnnouncementDetails(id: string, data: Prisma.AnnouncementUpdateInput): Promise<Announcement> {
    return prisma.announcement.update({ where: { id }, data });
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await prisma.announcement.delete({ where: { id } });
  }
}

export default new AnnouncementDao();
