import { useEffect, useState } from 'react';
import { FeatureGroup, Polygon, Polyline, GeoJSON as PolygonGeoJson, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'
import L, { LatLng } from 'leaflet';
import { COLORS } from '../../config/colors';

interface MapFeatureManagerProps {
  polygon: any[];
  setPolygon: (item: any[]) => void;

  editPolygon: any[];
  setEditPolygon: (item: any[]) => void;

  lines: any[];
  setLines: (item: any[]) => void;

  color?: string;
  fillColor?: string;
}

const MapFeatureManagerEdit = ({ polygon, setPolygon, editPolygon, setEditPolygon, lines, setLines, color, fillColor }: MapFeatureManagerProps) => {
  const map = useMap();
  // const [editPolygon, setEditPolygon] = useState<any[]>([])
  
  useEffect(() => {
    if (polygon && polygon.length > 0 && editPolygon?.length === 0) {
      const bounds = polygon[0].map((item: number[]) => [item[1], item[0]] as [number, number]);
      setEditPolygon([bounds]);
      map.fitBounds(bounds); // Fit the map to the geom bounds
    }
  }, [polygon]);


  const handleCreated = (e: any) => {
    const { layer } = e;
    if (layer instanceof L.Polygon) {
      setEditPolygon([layer.getLatLngs()]);
    } else if (layer instanceof L.Polyline) {
      // setLines(lines=> [...lines, layer.getLatLngs()]);
      // setLines((prevLines) => [...prevLines, layer.getLatLngs()]);
    }
  };

  const handleEdited = (e: any) => {
    const { layers } = e;

    layers.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        const latLngs1 = layer.getLatLngs() as L.LatLng[][];
        // console.log([latLngs1])
        
        // const layer2 = layer as any;
        // const latLngs = layer2.editing.latlngs

        // console.log(latLngs)
        setEditPolygon([latLngs1]);
      } 
      // else if (layer instanceof L.Polyline) {
        // setLines(lines.map((line, index) => (layer._leaflet_id === index ? layer.getLatLngs() : line)));
        // setLines(lines.map((line) => line.getLatLngs()));
      // }
    });
  };

  const handleDeleted = (e: any) => {
    const { layers } = e;
    layers.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        setEditPolygon([]);
      } else if (layer instanceof L.Polyline) {
        // setLines(lines.filter((line) => line !== layer.getLatLngs()));
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
          polygon: editPolygon.length === 0 ? {} : false,
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
      {editPolygon.length > 0 && (
        <Polygon
          key={Math.random()}
          positions={editPolygon[0]}
          pathOptions={{ color: `${color ? color : COLORS.green[500]}`, fillColor: `${fillColor ? fillColor : COLORS.green[500]}` }}
        />
      )}



      {lines.map((line, index) => (
        <Polyline key={index} positions={line} />
      ))}
    </FeatureGroup>
  );
};

export default MapFeatureManagerEdit;
