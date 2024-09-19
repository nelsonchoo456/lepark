import { useCallback, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurrenceCreate';

const center = {
  lat: 1.3503881629328163,
  lng: 103.85132690751749,
};

interface DraggableMarkerProps {
  lat: number;
  lng: number;
  adjustLatLng: (props: AdjustLatLngInterface) => void;
}

function DraggableMarker({ lat, lng, adjustLatLng }: DraggableMarkerProps) {
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

  return <Marker draggable={true} eventHandlers={eventHandlers} position={[lat, lng]} ref={markerRef}></Marker>;
}

export default DraggableMarker;
