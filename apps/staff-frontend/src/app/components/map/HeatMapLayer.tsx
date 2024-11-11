import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L, { Control, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { getPastOneHourCrowdDataBySensorsForPark, HeatMapCrowdResponse, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { message } from 'antd';
import * as turf from '@turf/turf';
import './styles/HeatMapLayer.css';

interface HeatmapLayer {
  park: ParkResponse;
  zone?: ZoneResponse;
}
// Custom hook to add a heatmap layer
const HeatmapLayer = ({ park, zone }: HeatmapLayer) => {
  const map = useMap();
  const intensityOpacityFactor = 1; // To increase the opacity
  const [crowdData, setCrowdData] = useState<HeatMapCrowdResponse[]>()
  const [messageApi, contextHolder] = message.useMessage();

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
        messageApi.open({
          type: 'error',
          content: "No camera readings available in the last hour",
        });
      }
    }

  }

  useEffect(() => {
    if (crowdData && crowdData.length > 0) {
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
          // radius: 40,
          // blur: 25,
          radius: 25,
          blur: 19,
          // maxZoom: 14,
          maxZoom: 15,
          gradient: {
            0.1: '#006400',   // Dark Green
            0.15: '#2e8b57',  // Sea Green
            0.2: '#3d961d',   // Medium Green
            0.25: '#66c56a',  // Soft Green
            0.3: '#9fba18',   // Yellow-Green
            0.35: '#b8c831',  // Light Yellow-Green
            0.45: '#d3c627',  // Yellow
            0.5: '#e3c727',   // Yellow
            0.55: '#f0ce34',  // Light Yellow
            0.6: '#f5d042',   // Light Yellow
            0.7: '#f5a623',   // Orange
            0.75: '#ff9933',  // Darker Orange
            0.8: '#ff8c00',   // Dark Orange
            0.85: '#ff6600',  // Orange-Red
            0.9: '#ff4500',   // Orange-Red
            0.95: '#ff0000',
            0.97: '#ff0066'
          },
          maxOpacity: 1,
          pane: 'heatmapPane',
        }
      );
      heatLayer.addTo(map);

      // Add legend control
      const legend = new Control({ position: 'bottomright' });
      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'heatmap-legend'); 
        div.innerHTML = `
          <h4>Heatmap Intensity</h4>
          <div class="legend-spectrum"></div>
          <div class="legend-labels">
            <span>0</span>
            <span>${Math.round(maxIntensity)}</span>
          </div>`;
        return div;
      };
      legend.addTo(map);

      return () => {
        map.removeLayer(heatLayer);
        map.removeControl(legend);
      };
    }
  }, [crowdData, map]);

  return contextHolder;
};

export default HeatmapLayer;