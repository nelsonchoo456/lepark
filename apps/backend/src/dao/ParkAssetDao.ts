import { PrismaClient, Prisma, ParkAsset, Facility } from '@prisma/client';
import ParkDao from './ParkDao';
import FacilityDao from './FacilityDao';
import { ParkResponseData } from '../schemas/parkSchema';

const prisma = new PrismaClient();

class ParkAssetDao {
  public async createParkAsset(
    data: Prisma.ParkAssetCreateInput
  ): Promise<ParkAsset> {
    return prisma.parkAsset.create({ data });
  }

  public async getAllParkAssets(): Promise<(ParkAsset & { facility?: Facility; park?: ParkResponseData })[]> {
    const parkAssets = await prisma.parkAsset.findMany({
      include: {
        maintenanceTasks: true,
        facility: true,
      },
    });

    const parkAssetsWithDetails = await Promise.all(
      parkAssets.map(async (asset) => {
        let facility, park;

        if (asset.facilityId) {
          const fetchedFacility = await FacilityDao.getFacilityById(asset.facilityId);
          facility = fetchedFacility;

          if (facility?.parkId) {
            const fetchedPark = await ParkDao.getParkById(facility.parkId);
            park = fetchedPark;
          }
        }
        return {
          ...asset,
          facility: facility || null,
          park: park || null,
        };
      }),
    );

    return parkAssetsWithDetails;
  }

  public async getParkAssetById(
    id: string
  ): Promise<ParkAsset | null> {
    return prisma.parkAsset.findUnique({
      where: { id },
      include: {
        maintenanceTasks: true,
        facility: {
          select: {
            id: true,
            name: true,
            parkId: true,
            lat: true,
            long: true
          },
        },
      },
    });
  }

  public async updateParkAsset(
    id: string, 
    data: Prisma.ParkAssetUpdateInput
  ): Promise<ParkAsset> {
    return prisma.parkAsset.update({
      where: { id },
      data,
    });
  }

  public async deleteParkAsset(
    id: string
  ): Promise<void> {
    await prisma.parkAsset.delete({ where: { id } });
  }

  public async getParkAssetsNeedingMaintenance(): Promise<ParkAsset[]> {
    const currentDate = new Date();
    return prisma.parkAsset.findMany({
      where: {
        nextMaintenanceDate: {
          lte: currentDate,
        },
      },
      include: {
        maintenanceTasks: true,
      },
    });
  }

  public async getAllParkAssetsByParkId(
    parkId: number
  ): Promise<ParkAsset[]> {
    const parkAssets = await prisma.parkAsset.findMany({
      where: {
        facility: {
          parkId: parkId,
        },
      },
      include: {
        facility: true,
      },
    });

    const park = await ParkDao.getParkById(parkId);
    return parkAssets.map((asset) => ({
      ...asset,
      facilityName: asset.facility?.name,
      parkName: park?.name,
    }));
  }

  public async getParkAssetByIdentifierNumber(
    identifierNumber: string
  ): Promise<ParkAsset | null> {
    return prisma.parkAsset.findUnique({
      where: { identifierNumber },
      include: {
        maintenanceTasks: true,
        facility: true,
      },
    });
  }

  public async getParkAssetBySerialNumber(
    serialNumber: string
  ): Promise<ParkAsset | null> {
    return prisma.parkAsset.findFirst({
      where: { serialNumber },
      include: {
        maintenanceTasks: true,
        facility: {
          select: {
            id: true,
            name: true,
            parkId: true,
          },
        },
      },
    });
  }

  public async isSerialNumberDuplicate(
    serialNumber: string | null, 
    excludeParkAssetId?: string
  ): Promise<boolean> {
    if (!serialNumber) return false;
    const parkAsset = await prisma.parkAsset.findFirst({
      where: {
        serialNumber,
        id: { not: excludeParkAssetId },
      },
    });
    return !!parkAsset;
  }
}

export default new ParkAssetDao();
