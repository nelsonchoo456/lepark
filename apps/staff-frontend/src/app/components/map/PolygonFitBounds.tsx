import { Marker, Polygon, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { GeomType } from './interfaces/interfaces';
import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurrenceCreate';
import { getCentroidOfGeom } from './functions/functions';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { renderToStaticMarkup } from "react-dom/server";
import { COLORS } from '../../config/colors';

interface ZonePolygonProps {
  geom: GeomType;
  adjustLatLng?: (props: AdjustLatLngInterface) => void;
  lat?: number;
  lng?: number;
  polygonLabel?: string;
  color?: string;
  fillColor?: string;
}

const PolygonFitBounds = ({ geom, adjustLatLng, lat, lng, polygonLabel, color, fillColor }: ZonePolygonProps) => {
  const map = useMap();
  const centroid = getCentroidOfGeom(geom);

  useEffect(() => {
    if (geom?.coordinates && geom.coordinates.length > 0) {
      const bounds = geom.coordinates[0].map((item: number[]) => [item[1], item[0]] as [number, number]);
      map.fitBounds(bounds); // Fit the map to the geom bounds

      if (adjustLatLng && lat && lng) {
        const point = turf.point([lng, lat]);
        const polygon = turf.polygon([geom.coordinates[0]]);

        if (geom?.coordinates && !turf.booleanPointInPolygon(point, polygon)) {
          const latLng = getCentroidOfGeom(geom);
          if (latLng) {
            adjustLatLng(latLng);
          }
        }
      }
    }
  }, [lat, lng, geom, map]);

  const getLabelIcon = () => {
    const iconHTML = renderToStaticMarkup(
      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', textShadow: `-1px -1px 0 ${COLORS.green[600]}, 1px -1px 0 ${COLORS.green[600]}, -1px 1px 0 ${COLORS.green[600]}, 1px 1px 0 ${COLORS.green[600]}`, textWrap: "nowrap" }}>{polygonLabel}</span>
		);

		return L.divIcon({
			html: iconHTML,
      iconSize: [40, 40],
      className: ''
		});
	};

  return (
    <>
    {geom?.coordinates &&
      geom.coordinates.length > 0 && (
      <Polygon
        positions={geom.coordinates[0].map((item: number[]) => [item[1], item[0]])}
        pathOptions={{ color: `${color ? color : COLORS.green[500]}`, fillColor: `${fillColor ? fillColor : COLORS.green[500]}` }}
      />
    )}
    {
      polygonLabel && centroid?.lat && centroid.lng &&
      <Marker key="polygon-label" position={[centroid?.lat, centroid?.lng]} icon={getLabelIcon()} opacity={1}/>
    }
    </>
  );
};

export default PolygonFitBounds;
