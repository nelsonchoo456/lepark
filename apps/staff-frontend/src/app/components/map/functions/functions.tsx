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

  const latLngs = geom.coordinates[0].map((coord: number[]) => L.latLng(coord[1], coord[0])); // Convert to LatLng

  const bounds = L.latLngBounds(latLngs); // Get the bounds of the polygon
  const center = bounds.getCenter(); // Get the center of the bounds

  return { lat: center.lat, lng: center.lng };
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

    // Convert to GeoJSON Polygon
    const newPolygonGeoJSON = turf.polygon([checkingPolygon]);
    const existingPolygonGeoJSON = turf.polygon([existingPolygon]);

    // Check if newPolygon is fully within existingPolygon
    return turf.booleanWithin(newPolygonGeoJSON, existingPolygonGeoJSON);
  } catch (error) {
    throw new Error("Unable to check if the boundaries is valid.");
  }
};