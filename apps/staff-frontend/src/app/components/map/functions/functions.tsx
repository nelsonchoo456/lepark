import { LatLng } from "leaflet";

export function latLngArrayToPolygon(latLngArray: any) {
  // Map over the array and format each {lat, lng} pair as "lng lat"
  console.log(latLngArray)
  const coordinates = latLngArray.map((point: LatLng) => `${point.lng} ${point.lat}`).join(', ');

  // Ensure the polygon is closed by repeating the first point at the end
  const firstPoint = `${latLngArray[0].lng} ${latLngArray[0].lat}`;
  
  // Return the POLYGON string
  return `POLYGON((${coordinates}, ${firstPoint}))`;
}