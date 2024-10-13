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

export function calculateNetflixHoursOffset(totalSequestration: number): number {
  const NETFLIX_EMISSIONS_PER_HOUR = 100 / 1000; // 100g converted to kg
  const dailySequestration = totalSequestration / 365; // kg CO2 per day

  const netflixHoursOffset = dailySequestration / NETFLIX_EMISSIONS_PER_HOUR;

  return Math.floor(netflixHoursOffset); // Round down to the nearest whole hour
}

export function calculateA380FlightTime(totalSequestration: number): { hours: number; minutes: number } {
  const PASSENGERS = 525;
  const CRUISE_SPEED = 903; // km/h
  const CO2_PER_PASSENGER_KM = 75 / 1000; // 75g converted to kg

  // Calculate CO2 emissions per hour for a full A380
  const CO2_PER_HOUR = PASSENGERS * CRUISE_SPEED * CO2_PER_PASSENGER_KM;

  // Calculate flight hours
  const totalHours = totalSequestration / CO2_PER_HOUR;

  // Convert to hours and minutes
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  return { hours, minutes };
}

  export function calculateSmartphoneChargesPerDay(sequestration: number): number {
     const SMARTPHONE_CHARGE_EMISSIONS = 0.009; // kg CO2 per full charge
     const dailySequestration = sequestration / 365; // kg CO2 per day
     return Math.round(dailySequestration / SMARTPHONE_CHARGE_EMISSIONS);
   }
