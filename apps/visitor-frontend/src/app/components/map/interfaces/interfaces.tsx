import { Layer, LayerOptions } from "leaflet";

interface CustomLayerOptions {
	fillColor?: string;
	color?: string;
}

interface GeoManLayersOptions extends LayerOptions, CustomLayerOptions {}

export interface GeoManLayers extends Layer {
	_leaflet_id?: string;
	_shape?: string;
	options: GeoManLayersOptions
}

export interface GeomType {
  coordinates: number[][][]; // Adjust this to match the exact structure of your coordinates
}

export interface HoverItem {
  id: string;
  title: string | JSX.Element | JSX.Element[];
  image?: string | null;
  entityType: string;
  children?: string | JSX.Element | JSX.Element[];
  showImage?: boolean;
}