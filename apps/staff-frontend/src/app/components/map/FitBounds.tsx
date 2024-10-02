import { useMap } from "react-leaflet";
import { GeomType } from "./interfaces/interfaces";
import { useEffect } from "react";

interface FitBoundsProps {
  geom: GeomType;
}

const FitBounds = ({geom}: FitBoundsProps) => {
  const map = useMap();

  useEffect(() => {
    if (geom?.coordinates && geom.coordinates.length > 0) {
      const bounds = geom.coordinates[0].map((item: number[]) => [item[1], item[0]] as [number, number]);
      map.fitBounds(bounds); // Fit/zoom the map to the geom bounds
      
    }
  }, [geom, map]);

  return <></>
}

export default FitBounds