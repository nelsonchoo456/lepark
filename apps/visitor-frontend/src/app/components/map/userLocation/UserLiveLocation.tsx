import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const UserLiveLocationMap = () => {
  // const [position, setPosition] = useState<number[]>([51.505, -0.09]); // default location
  const [lat, setLat] = useState<number>();
  const [lng, setLng] = useState<number>();


  // Custom icon for the user's location marker
  const userIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude, heading } = position.coords;
        setLat(latitude);
        setLng(longitude)
        console.log(latitude)
      }, (error) => {
        console.error("Error getting location:", error);
      }, {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 60000,
      });
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  return lat && lng ? <>Your location: {lat}, {lng}</> : null;
};

export default UserLiveLocationMap;
