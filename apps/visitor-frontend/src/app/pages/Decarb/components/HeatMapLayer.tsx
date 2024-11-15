import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L, { Control, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { getPastOneHourCrowdDataBySensorsForPark, HeatMapCrowdResponse, OccurrenceResponse, ParkResponse, ZoneResponse } from '@lepark/data-access';
import { message } from 'antd';
import * as turf from '@turf/turf';
import './styles/HeatMapLayer.css';

interface HeatmapLayer {
  occurrences: (OccurrenceResponse & { seq: number })[]
}
// Custom hook to add a heatmap layer
const HeatmapLayer = ({ occurrences }: HeatmapLayer) => {
  const map = useMap();
  const intensityOpacityFactor = 1; // To increase the opacity
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (occurrences && occurrences.length > 0) {
      const maxIntensity = Math.max(...occurrences.map((item) => item.seq)) * 1.05;
      const normalizedHeatData = occurrences.map((item) => [
        item.lat,
        item.lng,
        item.seq / maxIntensity * intensityOpacityFactor,
      ]);

      const heatLayer = (L as any).heatLayer(
        normalizedHeatData.map(([lat, lng, intensity]) => [lat, lng, intensity]),
        {
          // radius: 40,
          // blur: 25,
          radius: 20,
          blur: 10,
          // maxZoom: 14,
          maxZoom: 15,
          gradient: {
            // 0.0: '#f2ef18',   // Brighter Yellow
            // 0.05: '#ffeb66',   // Warm Yellow
            // 0.1: '#f0ed41',   // Bright Yellow
            // 0.15: '#f3fa66',   // Strong Yellow
            // 0.2: '#daeb7a',   // Yellowish-Green
            // 0.3:'#c9eb7a',   // Light Yello w-Green (transition point to Green)

            
            // 0.7: '#2be128',   // Medium Green
            // 0.8: '#28e155',   // Bright Green
            // 0.9: '#15cf40',    // Brightest, Happiest Green
            // 1.0: '#06ba2f'
            0.0: '#e0f265',  // Pale Yellow
            0.1: '#c9ee5f',  // Light Yellow-Green
            0.2: '#b0e857',  // Soft Yellow-Green
            0.3: '#98e34f',  // Yellow-Green
            0.4: '#7fdd47',  // Lime Green
            0.5: '#66d940',  // Light Lime Green
            0.6: '#58c438',  // Light Green
            0.7: '#4aae31',  // Medium Green
            0.8: '#3d972b',  // Medium Dark Green
            0.9: '#2f7b24',  // Forest Green
            1.0: '#215f1e'   // Dark Green
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
          <h4>Sequestration by Occurrences</h4>
          <div class="legend-spectrum"></div>
          <div class="legend-labels">
            <span>0</span>
            <span>${Math.round(maxIntensity)} in kg</span>
          </div>`;
        return div;
      };
      legend.addTo(map);

      return () => {
        map.removeLayer(heatLayer);
        map.removeControl(legend);
      };
    }
  }, [occurrences, map]);

  return contextHolder;
};

export default HeatmapLayer;