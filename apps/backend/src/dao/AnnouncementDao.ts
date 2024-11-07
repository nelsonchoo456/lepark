import { PrismaClient, Prisma, Announcement } from '@prisma/client';

const prisma = new PrismaClient();

class AnnouncementDao {
  public async createAnnouncement(
    data: Prisma.AnnouncementCreateInput
  ): Promise<Announcement> {
    return prisma.announcement.create({ data });
  }

  public async getAllAnnouncements(): Promise<Announcement[]> {
    return prisma.announcement.findMany();
  }

  public async getAnnouncementsByParkId(
    parkId: number
  ): Promise<Announcement[]> {
    return prisma.announcement.findMany({ where: { parkId } });
  }

  public async getNParksAnnouncements(): Promise<Announcement[]> {
    return prisma.announcement.findMany({ where: { parkId: null } });
  }

  public async getAnnouncementById(
    id: string
  ): Promise<Announcement | null> {
    return prisma.announcement.findUnique({ where: { id } });
  }

  public async updateAnnouncementDetails(
    id: string, 
    data: Prisma.AnnouncementUpdateInput
  ): Promise<Announcement> {
    return prisma.announcement.update({ where: { id }, data });
  }

  public async deleteAnnouncement(
    id: string
  ): Promise<void> {
    await prisma.announcement.delete({ where: { id } });
  }
}

export default new AnnouncementDao();
