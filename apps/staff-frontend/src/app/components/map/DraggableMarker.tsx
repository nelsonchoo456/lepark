import { useCallback, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurrenceCreate';
import { renderToStaticMarkup } from 'react-dom/server';
import { CustomMarker, CustomMarkerInner } from '@lepark/common-ui';

export const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

interface DraggableMarkerProps {
  lat?: number;
  lng?: number;
  adjustLatLng: (props: AdjustLatLngInterface) => void;
  circleWidth?: number;
  backgroundColor?: string;
}

function DraggableMarker({ lat = center.lat, lng = center.lng, adjustLatLng, circleWidth, backgroundColor }: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          // setPosition(marker?.getLatLng())
          adjustLatLng(marker?.getLatLng());
        }
      },
    }),
    [],
  );

  const getCustomIcon = () => {
    const iconHTML = renderToStaticMarkup(
      <CustomMarker circleWidth={circleWidth} backgroundColor={backgroundColor}>
        <CustomMarkerInner circleWidth={circleWidth} backgroundColor={backgroundColor}>
        </CustomMarkerInner>
      </CustomMarker>
    )
    return L.divIcon({
			html: iconHTML,
			iconSize: [32, 40],
      iconAnchor: circleWidth ? [circleWidth / 2, circleWidth] : [16, 32],
      className: ''
		});
  }

  return <Marker draggable={true} eventHandlers={eventHandlers} position={[lat, lng]} ref={markerRef} icon={getCustomIcon()}></Marker>;
}

export default DraggableMarker;
