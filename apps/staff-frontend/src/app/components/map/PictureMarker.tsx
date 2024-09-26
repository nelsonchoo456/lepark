import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, Tooltip } from 'react-leaflet';
import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurrenceCreate';
import { renderToStaticMarkup } from 'react-dom/server';
import { HtmlPictureMarker, PictureMarkerInner } from '@lepark/common-ui';
import { COLORS } from '../../config/colors';
import { HoverItem } from './HoverInformation';

interface PictureMarkerProps {
  id: string;
  entityType: string;
  lat: number;
  lng: number;
  circleWidth?: number;
  backgroundColor?: string;
  innerBackgroundColor?: string;
  icon?: string | JSX.Element | JSX.Element[];
  tooltipLabel?: string | JSX.Element | JSX.Element[];
  tooltipLabelPermanent?: boolean;
  teardrop?: boolean;
  hovered?: HoverItem | null;
  setHovered?: (hovered: any) => void;
}

function PictureMarker({
  id,
  entityType,
  lat,
  lng,
  circleWidth = 38,
  backgroundColor,
  icon,
  tooltipLabel,
  tooltipLabelPermanent,
  teardrop = true,
  innerBackgroundColor,
  hovered,
  setHovered,
}: PictureMarkerProps) {
  const [offsetY, setOffsetY] = useState<number>(0);
  const markerRef = useRef<L.Marker>(null);

  if (!teardrop) {
    const getCustomIcon = (offsetY = 0) => {

      const iconHTML = renderToStaticMarkup(
        // <HtmlPictureMarker circleWidth={circleWidth} backgroundColor={backgroundColor}>
        <PictureMarkerInner
          circleWidth={circleWidth}
          innerBackgroundColor={innerBackgroundColor ? innerBackgroundColor : COLORS.sky[400]}
        >
          {icon}
        </PictureMarkerInner>,
        // </HtmlPictureMarker>
      );
      
      if (entityType === "FACILITY") {
        return L.divIcon({
          html: iconHTML,
          iconSize: [32, 40],
          iconAnchor: [circleWidth / 2, circleWidth],
          className: '',
        });
      } 

      return L.divIcon({
        html: iconHTML,
        iconSize: [32, 40],
        iconAnchor: [16, 40 - offsetY],
        className: '',
      });
    };

    return (
      <Marker
        position={[lat, lng]}
        ref={markerRef}
        icon={getCustomIcon()}
        eventHandlers={{
          click: () => setHovered && setHovered({ id: id, image: icon, title: tooltipLabel, entityType: entityType }),
        }}
        riseOnHover
      >
        {tooltipLabel && (
          <Tooltip offset={[20, -10]} permanent={tooltipLabelPermanent}>
            {tooltipLabel}
          </Tooltip>
        )}
      </Marker>
    );
  }

  const getCustomIcon = (offsetY = 0) => {
    const iconHTML = renderToStaticMarkup(
      <HtmlPictureMarker circleWidth={circleWidth} backgroundColor={backgroundColor}>
        <PictureMarkerInner circleWidth={circleWidth} backgroundColor={backgroundColor}>
          {icon}
        </PictureMarkerInner>
      </HtmlPictureMarker>,
    );

    return L.divIcon({
      html: iconHTML,
      iconSize: [32, 40],
      iconAnchor: [16, 40 - offsetY],
      className: '',
    });
  };

  return (
    <Marker
      position={[lat, lng]}
      ref={markerRef}
      icon={getCustomIcon()}
      eventHandlers={{
        click: setHovered,
      }}
      riseOnHover
    >
      {tooltipLabel && (
        <Tooltip offset={[20, -10]} permanent={tooltipLabelPermanent}>
          {tooltipLabel}
        </Tooltip>
      )}
    </Marker>
  );
}

export default PictureMarker;
