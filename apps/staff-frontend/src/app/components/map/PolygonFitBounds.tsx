import { Polygon, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { GeomType } from './interfaces/interfaces';
import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurrenceCreate';
import { getCentroidOfGeom } from './functions/functions';

interface ZonePolygonProps {
  geom: GeomType;
  adjustLatLng?: (props: AdjustLatLngInterface) => void;
}

const PolygonFitBounds = ({ geom, adjustLatLng }: ZonePolygonProps) => {
  const map = useMap();

  useEffect(() => {
    if (geom?.coordinates && geom.coordinates.length > 0) {
      const bounds = geom.coordinates[0].map((item: number[]) => [item[1], item[0]] as [number, number]);
      map.fitBounds(bounds); // Fit the map to the geom bounds

      if (adjustLatLng) {
        if (geom?.coordinates) {
          const latLng = getCentroidOfGeom(geom);
          if (latLng) {
            adjustLatLng(latLng);
          }
        }
      }
    }
  }, [geom, map]);

  return (
    geom?.coordinates &&
    geom.coordinates.length > 0 && (
      <Polygon
        positions={geom.coordinates[0].map((item: number[]) => [item[1], item[0]])}
        pathOptions={{ color: 'transparent', fillColor: '#006400' }}
      />
    )
  );
};

export default PolygonFitBounds;
