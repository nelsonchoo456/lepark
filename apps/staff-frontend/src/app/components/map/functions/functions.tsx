import L, { LatLng } from "leaflet";
import { GeomType } from "../interfaces/interfaces";
import { AdjustLatLngInterface } from "../../../pages/Occurrence/OccurrenceCreate";

export function latLngArrayToPolygon(latLngArray: any): string {
  // Map over the array and format each {lat, lng} pair as "lng lat"
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

  // const coordinates = geom.coordinates[0];
  // const totalPoints = coordinates.length;

  // const [totalLat, totalLng] = coordinates.reduce(
  //   (acc, coord) => {
  //     acc[0] += coord[1]; // Latitude (Y)
  //     acc[1] += coord[0]; // Longitude (X)
  //     return acc;
  //   },
  //   [0, 0]
  // );

  // const centroidLat = totalLat / totalPoints;
  // const centroidLng = totalLng / totalPoints;

  // return { lat: centroidLat, lng: centroidLng };

  const latLngs = geom.coordinates[0].map((coord: number[]) => L.latLng(coord[1], coord[0])); // Convert to LatLng

  const bounds = L.latLngBounds(latLngs); // Get the bounds of the polygon
  const center = bounds.getCenter(); // Get the center of the bounds

  return { lat: center.lat, lng: center.lng };
}