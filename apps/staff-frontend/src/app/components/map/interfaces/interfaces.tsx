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