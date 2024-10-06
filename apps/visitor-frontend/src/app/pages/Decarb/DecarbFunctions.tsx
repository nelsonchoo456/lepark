import { getTotalSequestrationForParkAndDate } from '@lepark/data-access';


export async function fetchTotalSequestration(parkId: number, date: string): Promise<number> {
  try {
    const response = await getTotalSequestrationForParkAndDate(parkId, date);
    return response.data.totalSequestration;
  } catch (error) {
    console.error('Error fetching total sequestration:', error);
    throw error;
  }
}

export function calculateHDBPoweredDays(totalSequestration: number): number {
  const AVERAGE_DAILY_CONSUMPTION = 370 / 30; // kWh (370 kWh per month / 30 days)
  const EMISSIONS_RATE = 0.4168; // kg CO₂ per kWh

  const dailyEmissions = AVERAGE_DAILY_CONSUMPTION * EMISSIONS_RATE;
  const poweredDays = totalSequestration / dailyEmissions;

  return Math.floor(poweredDays); // Round down to the nearest whole day
}
