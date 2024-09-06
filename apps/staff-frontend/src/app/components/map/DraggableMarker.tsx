import { useCallback, useMemo, useRef, useState } from 'react'
import L, { Layer } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { AdjustLatLngInterface } from '../../pages/Occurrence/OccurenceCreate';

const center = {
	lat: 1.3503881629328163,
	lng: 103.85132690751749,
};

interface DraggableMarkerProps {
  lat: number,
  lng: number,
  adjustLatLng: (props: AdjustLatLngInterface) => void;
}

function DraggableMarker({ lat, lng, adjustLatLng }: DraggableMarkerProps) {
  const [draggable, setDraggable] = useState(false)
  const [position, setPosition] = useState([lat, lng])
  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          // setPosition(marker?.getLatLng())
          adjustLatLng(marker?.getLatLng())
        }
      },
    }),
    [],
  )
  const toggleDraggable = useCallback(() => {
    setDraggable((d) => !d)
  }, [])

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
      <Popup minWidth={90}>
        <span onClick={toggleDraggable}>
          {draggable
            ? 'Marker is draggable'
            : 'Click here to make marker draggable'}
        </span>
      </Popup>
    </Marker>
  )
}

export default DraggableMarker;