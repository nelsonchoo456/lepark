import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { getPastOneHourCrowdDataBySensorsForPark, HeatMapCrowdResponse, ParkResponse, ZoneResponse } from '@lepark/data-access';

// Example crowd data [latitude, longitude, intensity]
const crowdData: [number, number, number][] = [
  [1.30921165304915, 103.8154900074005, 5],
  [1.307183192453113, 103.8165736198425, 10],
  [1.307646103106814, 103.816123008728, 20],
  // Add more data points as needed
];

interface HeatmapLayer {
  park: ParkResponse;
  zone?: ZoneResponse;
}
// Custom hook to add a heatmap layer
const HeatmapLayer = ({ park, zone }: HeatmapLayer) => {
  const map = useMap();
  const intensityOpacityFactor = 1; // To increase the opacity
  const [crowdData, setCrowdData] = useState<HeatMapCrowdResponse[]>()

  useEffect(() => {
    if (park) {
      fetchCrowdData(park.id)
    }
  }, [zone, park])

  const fetchCrowdData = async (parkId: number) => {
    try {
      const res = await getPastOneHourCrowdDataBySensorsForPark(parkId);
      if (res.status === 200) {
        if (zone) {
          setCrowdData(res.data.filter((c: HeatMapCrowdResponse) => c.zoneId === zone.id));
        } else {
          setCrowdData(res.data);
        }
        
      }
    } catch (e) {
      if (typeof e === "string" && e === "No camera readings available in the last hour") {
        console.log("yay")
      }
    }

  }

  useEffect(() => {
    if (crowdData) {
      const maxIntensity = crowdData.reduce((max, current) => 
        current.averageValue > max ? current.averageValue : max, 
        crowdData[0].averageValue
      ) *1.05;
      const normalizedCrowdData = crowdData.map((c) => [
        c.lat,
        c.long,
        c.averageValue / maxIntensity * intensityOpacityFactor,
      ]);
      const heatLayer = (L as any).heatLayer(
        normalizedCrowdData.map(([lat, lng, intensity]) => [lat, lng, intensity]),
        {
          radius: 40,
          blur: 25,
          maxZoom: 14,
          // gradient: {0.1: '#3d961d', 0.3: "#9fba18", 0.5: '#e3c727', 0.8: "#ffb300", 1: '#FF7F50'},
          gradient: {
            0.1: '#006400',   // Dark Green
            0.2: '#3d961d',   // Medium Green
            0.3: '#9fba18',   // Yellow-Green
            0.4: '#c3c832',   // Light Yellow-Green
            0.5: '#e3c727',   // Yellow
            0.6: '#f5d042',   // Light Yellow
            0.7: '#f5a623',   // Orange
            0.8: '#ff8c00',   // Dark Orange
            0.9: '#ff4500',   // Orange-Red
            0.95: '#ff0000',
            0.97: '#ff0066'
                // Coral
          },
          maxOpacity: 1,
          pane: 'heatmapPane',
        }
      );
      heatLayer.addTo(map);
      heatLayer.addTo(map);

      return () => {
        map.removeLayer(heatLayer);
      };
    }
  }, [crowdData, map]);

  return null;
};

export default HeatmapLayer;