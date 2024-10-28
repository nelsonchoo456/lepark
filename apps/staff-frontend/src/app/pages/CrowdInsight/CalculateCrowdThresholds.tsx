import * as turf from '@turf/turf';

interface Thresholds {
  low: number;
  moderate: number;
}

interface Park {
    id: number;
    geometry: string | any;
  }

export const calculateParkAreaAndThresholds = (parkGeom: string | any): { area: number; thresholds: Thresholds } => {
  let coords: number[][];

  if (typeof parkGeom === 'string') {
    const coordsMatch = parkGeom.match(/POLYGON\(\((.*?)\)\)/);
    if (!coordsMatch) {
      throw new Error("Invalid park geometry string");
    }
    coords = coordsMatch[1].split(',').map(pair => 
      pair.trim().split(' ').map(Number).reverse()
    );
  } else if (parkGeom && parkGeom.coordinates && Array.isArray(parkGeom.coordinates[0])) {
    coords = parkGeom.coordinates[0];
  } else {
    throw new Error("Invalid park geometry format");
  }

  const turfPolygon = turf.polygon([coords]);
  const areaInSquareMeters = turf.area(turfPolygon);
  const areaInSquareKm = areaInSquareMeters / 1000000;
  console.log(`areaInSquareKm of park`, areaInSquareKm);

  // Calculate thresholds based on park size
  // These values are kind of examples and should be adjusted based on actual data and requirements tbc
  const lowThreshold = Math.round(50 + (30 * areaInSquareKm));
  const moderateThreshold = Math.round(100 + (60 * areaInSquareKm));

  // Ensure thresholds don't exceed the maximum crowd level
  const finalLowThreshold = Math.min(lowThreshold, 100);
  const finalModerateThreshold = Math.min(moderateThreshold, 200);

  return {
    area: areaInSquareKm,
    thresholds: {
      low: finalLowThreshold,
      moderate: finalModerateThreshold
    }
  };
};

export const calculateCombinedParkThresholds = (parks: Park[]): Thresholds => {
    let totalArea = 0;
  
    for (const park of parks) {
      const { area } = calculateParkAreaAndThresholds(park.geometry);
      totalArea += area;
    }
  
    console.log(`Total area of all parks in square km:`, totalArea);
  
    // Calculate thresholds based on combined park size
    // These values should be adjusted based on actual data and requirements
    const lowThreshold = Math.round(100 + (20 * totalArea));
    const moderateThreshold = Math.round(200 + (40 * totalArea));
  
    // Ensure thresholds don't exceed a reasonable maximum
    const finalLowThreshold = Math.min(lowThreshold, 500);
    const finalModerateThreshold = Math.min(moderateThreshold, 1000);
  
    return {
      low: finalLowThreshold,
      moderate: finalModerateThreshold
    };
  };
  
  export const useParkThresholds = (parkId: number, parkGeom: string | any | undefined, allParks: Park[]): Thresholds => {
    if (parkId === 0) {
      // Calculate thresholds for all parks combined
      return calculateCombinedParkThresholds(allParks);
    }
  
    if (!parkGeom) {
      return { low: 50, moderate: 100 }; // Default values if no geometry is provided
    }
  
    try {
      const { thresholds } = calculateParkAreaAndThresholds(parkGeom);
      return thresholds;
    } catch (error) {
      console.error("Error calculating park thresholds:", error);
      return { low: 50, moderate: 100 }; // Fallback to default values
    }
  };