import { Marker, Polygon } from "react-leaflet";
import { GeomType } from "./interfaces/interfaces"
import { getCentroidOfGeom } from "./functions/functions";
import { COLORS } from "../../config/colors";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";

interface PolygonWithLabelProps {
  geom: GeomType;
  color?: string;
  fillColor?: string;
  polygonLabel?: string;
  polygonFields?: {[key: string]: any};
}

const PolygonWithLabel= ({ geom, color, fillColor, polygonLabel, polygonFields }: PolygonWithLabelProps) => {
  const centroid = getCentroidOfGeom(geom);
  
  const getLabelIcon = () => {
    const iconHTML = renderToStaticMarkup(
      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', textShadow: `-1px -1px 0 ${COLORS.green[600]}, 1px -1px 0 ${COLORS.green[600]}, -1px 1px 0 ${COLORS.green[600]}, 1px 1px 0 ${COLORS.green[600]}`, textWrap: "nowrap" }}>{polygonLabel}</span>
		);

		return L.divIcon({
			html: iconHTML,
      iconSize: [40, 40],
      className: ''
		});
	};
  
  return <>
    {geom?.coordinates &&
      geom.coordinates.length > 0 && (
      <Polygon
        positions={geom.coordinates[0].map((item: number[]) => [item[1], item[0]])}
        pathOptions={{ color: `${color ? color : COLORS.green[500]}`, fillColor: `${fillColor ? fillColor : COLORS.green[500]}` }}
        fillOpacity={0.8}
        {...polygonFields}
      />
    )}
    {
      polygonLabel && centroid?.lat && centroid.lng &&
      <Marker key="polygon-label" position={[centroid?.lat, centroid?.lng]} icon={getLabelIcon()} opacity={1}/>
    }
  
  </>
}

export default PolygonWithLabel;