import { useRef, useState } from 'react';
import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { HtmlPictureMarker, HtmlPictureMarkerGlow, InnerPictureMarkerGlow, PictureMarkerInner } from '@lepark/common-ui';
import { COLORS } from '../../config/colors';
import { HoverItem } from './HoverInformation';

interface PictureMarkerProps {
  id: string;
  entityType: string;
  lat: number;
  lng: number;
  circleWidth?: number;
  backgroundColor?: string;
  innerBackgroundColor?: string;
  icon?: string | JSX.Element | JSX.Element[];
  tooltipLabel?: string | JSX.Element | JSX.Element[];
  tooltipLabelPermanent?: boolean;
  teardrop?: boolean;
  hovered?: HoverItem | null;
  setHovered?: (hovered: any) => void;
}

function PictureMarker({
  id,
  entityType,
  lat,
  lng,
  circleWidth = 38,
  backgroundColor,
  icon,
  tooltipLabel,
  tooltipLabelPermanent,
  teardrop = true,
  innerBackgroundColor,
  hovered,
  setHovered,
}: PictureMarkerProps) {
  const [offsetY, setOffsetY] = useState<number>(0);
  const markerRef = useRef<L.Marker>(null);

  if (!teardrop) {
    const getCustomIcon = (offsetY = 0) => {
      if (hovered && hovered?.id === id) {
        const thisCircleWidth = circleWidth * 1.3
        const iconHTML2 = renderToStaticMarkup(
          <InnerPictureMarkerGlow $circleWidth={thisCircleWidth} $backgroundColor={backgroundColor}>
            <PictureMarkerInner
              $circleWidth={thisCircleWidth}
              $innerBackgroundColor={innerBackgroundColor ? innerBackgroundColor : COLORS.sky[400]}
            >
              {icon}
            </PictureMarkerInner>
          </InnerPictureMarkerGlow>
        );

        return L.divIcon({
          html: iconHTML2,
          iconSize: [32, 40],
          iconAnchor: [thisCircleWidth / 2, thisCircleWidth / 2 - offsetY],
          className: '',
        });
      }

      const iconHTML = renderToStaticMarkup(
        <PictureMarkerInner
          $circleWidth={circleWidth}
          $innerBackgroundColor={innerBackgroundColor ? innerBackgroundColor : COLORS.sky[400]}
        >
          {icon}
        </PictureMarkerInner>
      );
      
      if (entityType === "FACILITY") {
        return L.divIcon({
          html: iconHTML,
          iconSize: [32, 40],
          iconAnchor: [circleWidth / 2, circleWidth / 2],
          className: '',
        });
      } 

      return L.divIcon({
        html: iconHTML,
        iconSize: [32, 40],
        iconAnchor: [circleWidth / 2, circleWidth / 2 - offsetY],
        className: '',
      });
    };

    return (
      <Marker
        position={[lat, lng]}
        ref={markerRef}
        icon={getCustomIcon()}
        eventHandlers={{
          click: () => setHovered && setHovered({ id: id, image: icon, title: tooltipLabel, entityType: entityType }),
        }}
        riseOnHover
      >
        {tooltipLabel && (
          <Tooltip offset={[20, -10]} permanent={tooltipLabelPermanent}>
            {tooltipLabel}
          </Tooltip>
        )}
      </Marker>
    );
  }
  
  const getCustomIcon = () => {
    let thisCircleWidth = circleWidth;
    if (hovered && hovered?.id === id) {
      thisCircleWidth = thisCircleWidth * 1.3

      const iconHTML = renderToStaticMarkup(
        <HtmlPictureMarkerGlow $circleWidth={thisCircleWidth} $backgroundColor={backgroundColor}>
          <HtmlPictureMarker $circleWidth={thisCircleWidth} $backgroundColor={backgroundColor}>
            <PictureMarkerInner $circleWidth={thisCircleWidth} $backgroundColor={backgroundColor}>
              {icon}
            </PictureMarkerInner>
          </HtmlPictureMarker>
        </HtmlPictureMarkerGlow>
      );
  
      return L.divIcon({
        html: iconHTML,
        iconSize: [32, 40],
        iconAnchor: [thisCircleWidth / 2 , thisCircleWidth],
        className: '',
      });
    }

    const iconHTML = renderToStaticMarkup(
      <HtmlPictureMarker $circleWidth={thisCircleWidth} $backgroundColor={backgroundColor}>
        <PictureMarkerInner $circleWidth={thisCircleWidth} $backgroundColor={backgroundColor}>
          {icon}
        </PictureMarkerInner>
      </HtmlPictureMarker>,
    );

    return L.divIcon({
      html: iconHTML,
      iconSize: [32, 40],
      iconAnchor: [thisCircleWidth / 2, thisCircleWidth],
      className: '',
    });
  };

  return (
    <Marker
      key={`${hovered ? "hovered" : ""}-${id}`}
      position={[lat, lng]}
      ref={markerRef}
      icon={getCustomIcon()}
      eventHandlers={{
        click: setHovered,
      }}
      riseOnHover
    >
      {tooltipLabel && (
        <Tooltip offset={[20, -10]} permanent={tooltipLabelPermanent}>
          {tooltipLabel}
        </Tooltip>
      )}
    </Marker>
  );
}

export default PictureMarker;
