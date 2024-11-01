import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Example crowd data [latitude, longitude, intensity]
const crowdData: [number, number, number][] = [
  [1.30921165304915, 103.8154900074005, 0.1],
  [1.307183192453113, 103.8165736198425, 0.9],
  [1.307646103106814, 103.816123008728, 0.8],
  // Add more data points as needed
];

// Custom hook to add a heatmap layer
const HeatmapLayer = () => {
  const map = useMap();

  useEffect(() => {
    const heatLayer = (L as any).heatLayer(
      crowdData.map(([lat, lng, intensity]) => [lat, lng, intensity]),
      {
        radius: 25,
        blur: 15,
        maxZoom: 17,
      }
    );
    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map]);

  return null;
};

export default HeatmapLayer;