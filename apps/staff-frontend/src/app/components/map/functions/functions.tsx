import L, { LatLng } from "leaflet";
import { GeomType } from "../interfaces/interfaces";
import { AdjustLatLngInterface } from "../../../pages/Occurrence/OccurrenceCreate";
import * as turf from '@turf/turf';

export const isLatLngArray = (input: any): input is LatLng[] => {
  // Check if the input is an array
  if (!Array.isArray(input)) {
    return false;
  }

  // Check each item in the array
  return input.every(item => {
    return (
      item &&
      typeof item === 'object' &&
      'lat' in item &&
      'lng' in item &&
      typeof item.lat === 'number' &&
      typeof item.lng === 'number'
    );
  });
};

export function latLngArrayToPolygon(latLngArray: any): string {
  if (!isLatLngArray(latLngArray)) {
    throw new Error("Please make a change to the boundaries.");
  }

  const coordinates = latLngArray.map((point: LatLng) => {
    if (!point.lng || !point.lat) {
      throw new Error("Please draw valid boundaries. This error may arise if you have unsaved changes");
    }
    return `${point.lng} ${point.lat}`
  }).join(', ');

  // Ensure the polygon is closed by repeating the first point at the end
  const firstPoint = `${latLngArray[0].lng} ${latLngArray[0].lat}`;
  
  // Return the POLYGON string
  return `POLYGON((${coordinates}, ${firstPoint}))`;
}

// Calculate centroid of geom
export function getCentroidOfGeom(geom: GeomType): AdjustLatLngInterface | null {
  if (!geom || !geom.coordinates || geom.coordinates.length === 0) {
    return null; // Handle cases where geom is invalid or empty
  }

  // Method 1
  // const latLngs = geom.coordinates[0].map((coord: number[]) => L.latLng(coord[1], coord[0])); // Convert to LatLng

  // const bounds = L.latLngBounds(latLngs); // Get the bounds of the polygon
  // const center = bounds.getCenter(); // Get the center of the bounds
  // return { lat: center.lat, lng: center.lng };

  // Method 2
  const coords = geom.coordinates[0];
  let area = 0;
  let centerX = 0;
  let centerY = 0;

  // Calculate centroid using the formula for polygons
  for (let i = 0; i < coords.length - 1; i++) {
    const x0 = coords[i][0];
    const y0 = coords[i][1];
    const x1 = coords[i + 1][0];
    const y1 = coords[i + 1][1];

    const factor = (x0 * y1 - x1 * y0);
    area += factor;
    centerX += (x0 + x1) * factor;
    centerY += (y0 + y1) * factor;
  }

  area *= 0.5;
  centerX /= (6 * area);
  centerY /= (6 * area);

  return { lat: centerY, lng: centerX };
}

export const polygonHasOverlap = (newPolygon: any[], existingPolygons?: number[][][]): boolean => {
  if (!existingPolygons) return false;
  try {
    
    const checkingPolygon = newPolygon.map((item: { lat: number, lng: number }) => ([item.lng, item.lat]));
    if (
      checkingPolygon.length > 0 &&
      (checkingPolygon[0][0] !== checkingPolygon[checkingPolygon.length - 1][0] ||
        checkingPolygon[0][1] !== checkingPolygon[checkingPolygon.length - 1][1])
    ) {
      checkingPolygon.push(checkingPolygon[0]); // Close the polygon
    }

    return existingPolygons?.some((polygon) => turf.booleanOverlap(turf.polygon([checkingPolygon]), turf.polygon([polygon])));
  } catch (error) {
    throw new Error("Unable to check for overlaps");
  }
};

export const polygonIsWithin = (newPolygon: any[], existingPolygon: number[][]): boolean => {
  try {
    const checkingPolygon = newPolygon.map((item) => [item.lng, item.lat]);

    if (
      checkingPolygon.length > 0 &&
      (checkingPolygon[0][0] !== checkingPolygon[checkingPolygon.length - 1][0] ||
        checkingPolygon[0][1] !== checkingPolygon[checkingPolygon.length - 1][1])
    ) {
      checkingPolygon.push(checkingPolygon[0]); 
    }

    const newPolygonGeoJSON = turf.polygon([checkingPolygon]);
    const existingPolygonGeoJSON = turf.polygon([existingPolygon]);

    return turf.booleanWithin(newPolygonGeoJSON, existingPolygonGeoJSON);
  } catch (error) {
    throw new Error("Unable to check if the boundaries are valid.");
  }
};

export const polygonIsWithinPark = (existingPolygon: number[][], newParkPolygon: any[]): boolean => {
  try {
    const checkingPolygon = newParkPolygon.map((item) => [item.lng, item.lat]);

    if (
      checkingPolygon.length > 0 &&
      (checkingPolygon[0][0] !== checkingPolygon[checkingPolygon.length - 1][0] ||
        checkingPolygon[0][1] !== checkingPolygon[checkingPolygon.length - 1][1])
    ) {
      checkingPolygon.push(checkingPolygon[0]); 
    }

    const newPolygonGeoJSON = turf.polygon([checkingPolygon]);
    const existingPolygonGeoJSON = turf.polygon([existingPolygon]);

    return turf.booleanWithin(existingPolygonGeoJSON, newPolygonGeoJSON);
  } catch (error) {
    console.error(error)
    throw new Error("Unable to check if the boundaries are valid.");
  }
};

export const pointsAreWithinPolygon = (newPolygon: any[], points?: {lat: number, lng: number}[]): boolean => {
  if (!points) return true;
  try {
    // Convert newPolygon to the format expected by Turf.js (number[][])
    const checkingPolygon = newPolygon.map((item) => [item.lng, item.lat]);

    // Ensure the polygon is closed
    if (
      checkingPolygon.length > 0 &&
      (checkingPolygon[0][0] !== checkingPolygon[checkingPolygon.length - 1][0] ||
        checkingPolygon[0][1] !== checkingPolygon[checkingPolygon.length - 1][1])
    ) {
      checkingPolygon.push(checkingPolygon[0]); // Close the polygon
    }

    const checkingPolygonGeoJSON = turf.polygon([checkingPolygon]);

    // Check if each point is within the polygon
    const allPointsWithin = points.every(({ lat, lng }) => {
      return turf.booleanPointInPolygon(turf.point([lng, lat]), checkingPolygonGeoJSON);
    });

    return allPointsWithin;

  } catch (error) {
    console.error(error)
    throw new Error("Unable to check if the boundaries are valid.");
  }
};