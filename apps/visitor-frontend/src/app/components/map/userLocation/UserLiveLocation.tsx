import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import { COLORS } from '../../../config/colors';
import { renderToStaticMarkup } from 'react-dom/server';
import { CustomMarker, CustomMarkerInner } from '@lepark/common-ui';
import { IoHappyOutline } from 'react-icons/io5';
import { FaFaceSmile, FaLocationArrow } from 'react-icons/fa6';

interface UserLiveLocationMapProps {
  lat: number,
  lng: number,
}
const UserLiveLocationMap = () => {
  // const [position, setPosition] = useState<number[]>([51.505, -0.09]); // default location
  const [lat, setLat] = useState<number>();
  const [lng, setLng] = useState<number>();
  const circleWidth = 40
  const backgroundColor = "#33d6d6"

  // Custom icon for the user's location marker
  const userIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const getCustomIcon = () => {
    const iconHTML = renderToStaticMarkup(
      <CustomMarker $circleWidth={circleWidth} $backgroundColor={backgroundColor}>
        <CustomMarkerInner $circleWidth={circleWidth} $backgroundColor={backgroundColor}>
          <FaLocationArrow style={{ fontSize: "1.3rem", color: "white" }}/>
        </CustomMarkerInner>
      </CustomMarker>
    )
    return L.divIcon({
			html: iconHTML,
			iconSize: [circleWidth, circleWidth],
      iconAnchor: circleWidth ? [circleWidth / 2, circleWidth + 8] : [16, 32],
      className: ''
		});
  }

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading } = position.coords;
          setLat(latitude);
          setLng(longitude);
          console.log(latitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 60000,
          timeout: 60000,
        },
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  return lat && lng ? (
    <>
      <Marker position={[lat, lng]} icon={getCustomIcon()} />
      <Circle
        center={[lat, lng]}
        radius={100} // Radius in meters
        pathOptions={{ color: backgroundColor, fillColor: backgroundColor, fillOpacity: 0.3 }}
      />
    </>
  ) : null;
};

export default UserLiveLocationMap;
