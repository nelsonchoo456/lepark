import { useEffect, useState } from 'react';
import { FeatureGroup, Polygon, Polyline, GeoJSON as PolygonGeoJson } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import L, { GeoJSON } from 'leaflet';
import { getAllParks, ParkResponse } from '@lepark/data-access';
import { COLORS } from '../../config/colors';

interface MapFeatureManagerProps {
  polygon: any[];
  setPolygon: (item: any[]) => void;
  lines: any[];
  setLines: (item: any[]) => void;

  color?: string;
  fillColor?: string;
}

const MapFeatureManager = ({ polygon, setPolygon, lines, setLines, color, fillColor }: MapFeatureManagerProps) => {
  // const [polygon, setPolygon] = useState<any[]>([]);  // Holds the single polygon
  // const [lines, setLines] = useState<any[]>([]);      // Holds the multiple lines


  const handleCreated = (e: any) => {
    const { layer } = e;
    if (layer instanceof L.Polygon) {
      setPolygon([layer.getLatLngs()]);
    } else if (layer instanceof L.Polyline) {

      // setLines(lines=> [...lines, layer.getLatLngs()]);
      // setLines((prevLines) => [...prevLines, layer.getLatLngs()]);
    }
  };

  const handleEdited = (e: any) => {
    const { layers } = e;

    layers.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        setPolygon([layer.getLatLngs()]);
      } else if (layer instanceof L.Polyline) {
        // setLines(lines.map((line, index) => (layer._leaflet_id === index ? layer.getLatLngs() : line)));
        setLines(lines.map((line) => line.getLatLngs()));
      }
    });
  };

  const handleDeleted = (e: any) => {
    const { layers } = e;
    layers.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        setPolygon([]);
      } else if (layer instanceof L.Polyline) {
        setLines(lines.filter((line) => line !== layer.getLatLngs()));
      }
    });
  };

  return (
    <FeatureGroup>
      {/* Drawing tools control */}
      <EditControl
        position="topright"
        onCreated={(e) => handleCreated(e)}
        onEdited={handleEdited}
        onDeleted={handleDeleted}
        draw={{
          // polygon: polygon.length === 0, // Only allow drawing polygon if one doesn't exist
          polygon: polygon.length === 0 ? {} : false,
          polyline: {}, // Allow multiple lines
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        }}
        edit={{
          edit: {
            selectedPathOptions: {
              maintainColor: true,
            },
          },
          remove: true,
        }}
      />
      {/* Render polygon if it exists */}
      {polygon.length > 0 && (
        <Polygon
          positions={polygon[0]}
          pathOptions={{ color: `${color ? color : COLORS.green[500]}`, fillColor: `${fillColor ? fillColor : COLORS.green[500]}` }}
          fillOpacity={0.75}
        />
      )}
      {/* {parks.length > 0 && <Polygon positions={parks} />} */}
      {/* {parks.length > 0 && <Polygon positions={tempPolygon2[0]} />} */}
      {/* Render multiple lines */}
      {lines.map((line, index) => (
        <Polyline key={index} positions={line} />
      ))}
    </FeatureGroup>
  );
};

export default MapFeatureManager;
