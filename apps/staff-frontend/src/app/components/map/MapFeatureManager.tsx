import { useEffect, useState } from 'react';
import { FeatureGroup, Polygon, Polyline, GeoJSON as PolygonGeoJson } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import L, { GeoJSON } from 'leaflet';
import { getAllParks, ParkResponse } from '@lepark/data-access';

const tempPolygon = [
  [
    [
      {
        lat: 1.2401524020202566,
        lng: 103.78715515136719,
      },
      {
        lat: 1.3300173076720356,
        lng: 103.78715515136719,
      },
      {
        lat: 1.3300173076720356,
        lng: 103.87435913085938,
      },
      {
        lat: 1.2586744333774667,
        lng: 103.8805389404297,
      },
    ],
  ],
];

const tempPolygon2 = [
  [
    [
      {
        lat: 1.292,
        lng: 103.854,
      },
      {
        lat: 1.293,
        lng: 103.855,
      },
      {
        lat: 1.292,
        lng: 103.856,
      },
      {
        lat: 1.291,
        lng: 103.855,
      },
      {
        lat: 1.292,
        lng: 103.854,
      },
    ],
  ],
];

interface MapFeatureManagerProps {
  polygon: any[];
  setPolygon: (item: any[]) => void;
  lines: any[];
  setLines: (item: any[]) => void;
}

const MapFeatureManager = ({ polygon, setPolygon, lines, setLines }: MapFeatureManagerProps) => {
  // const [polygon, setPolygon] = useState<any[]>([]);  // Holds the single polygon
  // const [lines, setLines] = useState<any[]>([]);      // Holds the multiple lines
  const [parks, setParks] = useState<any>([]);

  useEffect(() => {
    const fetchParks = async () => {
      try {
        const parksRes = await getAllParks();
        if (parksRes.status === 200) {
          const data = parksRes.data;

          const parkTemp = data.map((d) => d.geom.coordinates);

          const formattedCoordinates = parkTemp[0].map((polygon: any) =>
            polygon.map(([lng, lat]: number[]) => ({
              lat: lat,
              lng: lng,
            })),
          );

          setParks([formattedCoordinates]);
        }
      } catch (error) {
        //
      }
    };
    fetchParks();
  }, []);

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
      {polygon.length > 0 && <Polygon positions={polygon[0]} />}
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
