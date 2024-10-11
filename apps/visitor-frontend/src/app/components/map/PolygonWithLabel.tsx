import { Marker, Polygon, useMap } from 'react-leaflet';
import { GeomType } from './interfaces/interfaces';
import { getCentroidOfGeom } from './functions/functions';
import { COLORS } from '../../config/colors';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { Avatar } from 'antd';
import { TbTrees } from 'react-icons/tb';
import { useEffect, useState } from 'react';

interface PolygonWithLabelProps {
  entityId: string | number;
  geom: GeomType;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  polygonLabel?: any;
  polygonFields?: { [key: string]: any };
  handlePolygonClick?: () => void;
  handleMarkerClick?: () => void,
  labelFields?: { [key: string]: any };
  image?: string;
}

const PolygonWithLabel = ({
  entityId,
  geom,
  color,
  fillColor,
  fillOpacity,
  polygonLabel,
  labelFields,
  polygonFields,
  image,
  handlePolygonClick,
  handleMarkerClick
}: PolygonWithLabelProps) => {
  const map = useMap();
  const centroid = getCentroidOfGeom(geom);

  // const handlePolygonClick = () => {
  //   if (centroid && centroid.lat && centroid.lng) {
  //     const currentZoom = map.getZoom();
  //     map.setView([centroid.lat, centroid.lng], currentZoom + 3); // Zoom in by 3 levels
  //   }
  // };

  const getLabelIcon = () => {
    const iconHTML = renderToStaticMarkup(
      <div className="flex flex-col items-center">
        {image && image !== '' && (
          <div
            style={{
              backgroundImage: `url('${image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              overflow: 'hidden',
            }}
            className="h-12 w-12 rounded-full bg-gray-200 shadow-lg p-4 grow-0"
          />
        )}
        {image === '' && (
          <div className="h-12 w-12 rounded-full bg-gray-200 shadow-lg p-4 grow-0">
            <TbTrees className="text-lg opacity-40" />
          </div>
        )}

        <span
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            textShadow: `-1px -1px 0 ${COLORS.green[600]}, 1px -1px 0 ${COLORS.green[600]}, -1px 1px 0 ${COLORS.green[600]}, 1px 1px 0 ${COLORS.green[600]}`,
            textWrap: 'nowrap',
            ...labelFields,
          }}
        >
          {polygonLabel}
        </span>
      </div>,
    );

    return L.divIcon({
      html: iconHTML,
      iconSize: [40, 40],
      className: '',
    });
  };

  return (
    <>
      {geom?.coordinates && geom.coordinates.length > 0 && (
        <Polygon
          positions={geom.coordinates[0].map((item: number[]) => [item[1], item[0]])}
          pathOptions={{ color: `${color ? color : COLORS.green[500]}`, fillColor: `${fillColor ? fillColor : COLORS.green[500]}` }}
          fillOpacity={fillOpacity ? fillOpacity : 0.8}
          {...polygonFields}
          eventHandlers={{
            click: () =>
              handlePolygonClick &&
              handlePolygonClick(), // Zoom in on click
          }}
        />
      )}
      {polygonLabel && centroid?.lat && centroid.lng && (
        <Marker
          key="polygon-label"
          position={[centroid?.lat, centroid?.lng]}
          icon={getLabelIcon()}
          opacity={1}
          eventHandlers={{
            click: () =>
              handleMarkerClick &&
              handleMarkerClick()
          }}
        />
      )}
    </>
  );
};

export default PolygonWithLabel;
