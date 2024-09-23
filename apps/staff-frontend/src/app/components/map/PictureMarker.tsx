import { useCallback, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, Tooltip } from 'react-leaflet';
import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurrenceCreate';
import { renderToStaticMarkup } from 'react-dom/server';
import { HtmlPictureMarker, PictureMarkerInner } from '@lepark/common-ui';
import { COLORS } from '../../config/colors';

interface PictureMarkerProps {
  lat: number;
  lng: number;
  circleWidth?: number;
  backgroundColor?: string;
  innerBackgroundColor?: string;
  icon?: string | JSX.Element | JSX.Element[];
  tooltipLabel?: string | JSX.Element | JSX.Element[];
  tooltipLabelPermanent?: boolean;
  teardrop?: boolean;
}

function PictureMarker({ lat, lng, circleWidth, backgroundColor, icon, tooltipLabel, tooltipLabelPermanent, teardrop = true, innerBackgroundColor }: PictureMarkerProps) {
  
  const markerRef = useRef<L.Marker>(null);

  if (!teardrop) {
    const getCustomIcon = () => {
      const iconHTML = renderToStaticMarkup(
        // <HtmlPictureMarker circleWidth={circleWidth} backgroundColor={backgroundColor}>
        <PictureMarkerInner circleWidth={circleWidth} innerBackgroundColor={innerBackgroundColor ? innerBackgroundColor : COLORS.sky[400]}>
          {icon}
        </PictureMarkerInner>,
        // </HtmlPictureMarker>
      );
      return L.divIcon({
        html: iconHTML,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        className: '',
      });
    };
    //
    return (
      <Marker position={[lat, lng]} ref={markerRef} icon={getCustomIcon()}>
        {tooltipLabel && (
          <Tooltip offset={[20, -10]} permanent={tooltipLabelPermanent}>
            {tooltipLabel}
          </Tooltip>
        )}
      </Marker>
    );
  }

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
    {tooltipLabel && <Tooltip offset={[20, -10]} permanent={tooltipLabelPermanent}>{tooltipLabel}</Tooltip>}
  </Marker>;
}

export default PictureMarker;
