import { useCallback, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, Tooltip } from 'react-leaflet';
import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurrenceCreate';
import { renderToStaticMarkup } from 'react-dom/server';
import { HtmlPictureMarker, PictureMarkerInner } from '@lepark/common-ui';

interface PictureMarkerProps {
  lat: number;
  lng: number;
  circleWidth?: number;
  backgroundColor?: string;
  icon?: string | JSX.Element | JSX.Element[];
  tooltipLabel?: string | JSX.Element | JSX.Element[];
}

function PictureMarker({ lat, lng, circleWidth, backgroundColor, icon, tooltipLabel }: PictureMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  const getCustomIcon = () => {
    const iconHTML = renderToStaticMarkup(
      <HtmlPictureMarker circleWidth={circleWidth} backgroundColor={backgroundColor}>
        <PictureMarkerInner circleWidth={circleWidth} backgroundColor={backgroundColor}>
          {icon}
        </PictureMarkerInner>
      </HtmlPictureMarker>
    )
    return L.divIcon({
			html: iconHTML,
			iconSize: [32, 40],
      iconAnchor: [16, 40],
      className: ''
		});
  }

  return <Marker position={[lat, lng]} ref={markerRef} icon={getCustomIcon()}>
    {tooltipLabel && <Tooltip offset={[20, -10]} permanent>{tooltipLabel}</Tooltip>}
  </Marker>;
}

export default PictureMarker;
