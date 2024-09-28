import { PrismaClient, Prisma, ParkAsset, ParkAssetConditionEnum, ParkAssetStatusEnum, ParkAssetTypeEnum } from '@prisma/client';

const prisma = new PrismaClient();

class ParkAssetDao {
  async createParkAsset(data: Prisma.ParkAssetCreateInput): Promise<ParkAsset> {
    return prisma.parkAsset.create({ data });
  }

  async getAllParkAssets(): Promise<ParkAsset[]> {
    const parkAssets = await prisma.parkAsset.findMany({
      include: {
        maintenanceHistory: true,
        facility: {
          select: {
            id: true,
            name: true,
            parkId: true,
          },
        },
      },
    });

    return parkAssets.map((asset) => ({
      ...asset,
      facilityId: asset.facility.id,
      name: asset.facility.name,
      parkId: asset.facility.parkId,
    }));
  }

  async getParkAssetById(id: string): Promise<(ParkAsset & { name?: string; parkId?: number }) | null> {
    const asset = await prisma.parkAsset.findUnique({
      where: { id },
      include: {
        maintenanceHistory: true,
        facility: {
          select: {
            id: true,
            name: true,
            parkId: true,
          },
        },
      },
    });

    if (asset) {
      return {
        ...asset,
        facilityId: asset.facility.id,
        name: asset.facility.name,
        parkId: asset.facility.parkId,
      };
    }

    return null;
  }

  async updateParkAsset(id: string, data: Prisma.ParkAssetUpdateInput): Promise<ParkAsset> {
    return prisma.parkAsset.update({
      where: { id },
      data,
    });
  }

  async deleteParkAsset(id: string): Promise<void> {
    await prisma.parkAsset.delete({ where: { id } });
  }

  /*async getParkAssetsByType(parkAssetType: ParkAssetTypeEnum): Promise<ParkAsset[]> {
    return prisma.parkAsset.findMany({
      where: { parkAssetType },
      include: {
        maintenanceHistory: true,
      },
    });
  }

 async getParkAssetsByStatus(parkAssetStatus: Prisma.ParkAssetStatusEnum): Promise<ParkAsset[]> {
    return prisma.parkAsset.findMany({
      where: { parkAssetStatus },
      include: {
        maintenanceHistory: true,
      },
    });
  }

  async getParkAssetsByCondition(parkAssetCondition: Prisma.ParkAssetConditionEnum): Promise<ParkAsset[]> {
    return prisma.parkAsset.findMany({
      where: { parkAssetCondition },
      include: {
        maintenanceHistory: true,
      },
    });
  }  */

  async getParkAssetsNeedingMaintenance(): Promise<ParkAsset[]> {
    const currentDate = new Date();
    return prisma.parkAsset.findMany({
      where: {
        nextMaintenanceDate: {
          lte: currentDate,
        },
      },
      include: {
        maintenanceHistory: true,
      },
    });
  }

  async getAllParkAssetsByParkId(parkId: number): Promise<ParkAsset[]> {
    const parkAssets = await prisma.parkAsset.findMany({
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            parkId: true,
          },
        },
      },
    });

    return parkAssets
      .map((asset) => ({
        ...asset,
        facilityId: asset.facility?.id,
        name: asset.facility?.name,
        parkId: asset.facility?.parkId,
      }))
      .filter((asset) => asset.parkId === parkId);
  }
}

export default new ParkAssetDao();
