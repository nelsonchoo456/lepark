import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Example crowd data [latitude, longitude, intensity]
const crowdData: [number, number, number][] = [
  [1.30921165304915, 103.8154900074005, 5],
  [1.307183192453113, 103.8165736198425, 10],
  [1.307646103106814, 103.816123008728, 20],
  // Add more data points as needed
];

// Custom hook to add a heatmap layer
const HeatmapLayer = () => {
  const map = useMap();
  const intensityOpacityFactor = 1.5; // To increase the opacity

  const maxIntensity = Math.max(...crowdData.map(([, , intensity]) => intensity));
  const normalizedCrowdData = crowdData.map(([lat, lng, intensity]) => [
    lat,
    lng,
    intensity / maxIntensity * intensityOpacityFactor,
  ]);

  useEffect(() => {
    const heatLayer = (L as any).heatLayer(
      normalizedCrowdData.map(([lat, lng, intensity]) => [lat, lng, intensity]),
      {
        radius: 50,
        blur: 20,
        maxZoom: 17,
        gradient: {0.1: '#32b304', 0.3: "#b0d10f", 0.5: '#e3c727', 0.8: "#ffb300", 1: '#FF7F50'},
        maxOpacity: 1,
        // gradient: {5: 'yellow', 10: 'orange', 15: 'red'}
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