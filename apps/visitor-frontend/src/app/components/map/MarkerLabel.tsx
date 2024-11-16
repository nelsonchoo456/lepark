import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker } from "react-leaflet";
import { COLORS } from "../../config/colors";

interface MarkerLabelProps {
  lat: number;
  lng: number;
  entityId: string | number;
  label: string | JSX.Element;
  position?: "right" | "bottom";
  fillColor?: string;
  fillOpacity?: number;
  textColor?: string;
  textOutline?: string;
}

const MarkerLabel = ({ lat, lng, entityId, label, fillColor = COLORS.green[200], fillOpacity= 50, position="right", textColor="white", textOutline }: MarkerLabelProps) => {
  const circleWidth = 32
  const gap = circleWidth

  const getCustomIcon = () => {
    const backgroundColor = fillColor + fillOpacity
    const iconHTML = renderToStaticMarkup(
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgroundColor,
          borderRadius: '8px', // Rounded corners for a pill effect
          padding: '4px 8px',  // Padding to cover background fully
          whiteSpace: 'nowrap', // Prevent text wrapping
          minWidth: 'fit-content', // Adjust width to fit text
          fontWeight: 700,
          color: textColor,
          textShadow: textOutline ? `-1px -1px 0 ${textOutline}, 1px -1px 0 ${textOutline}, -1px 1px 0 ${textOutline}, 1px 1px 0 ${textOutline}` : "",
        }}
      >
        {label}
      </span>
    );

    return L.divIcon({
      html: iconHTML,
      iconSize: [circleWidth, circleWidth],
      iconAnchor: position === "right" ? [circleWidth / 2 - gap, circleWidth / 2] : [circleWidth / 2 + 5, circleWidth / 2 - gap * 3/4],
      className: '',
    });
  }

  return (
    <Marker position={[lat, lng]} icon={getCustomIcon()}/>
  )
}

export default MarkerLabel;