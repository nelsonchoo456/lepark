import { useEffect, useRef, useState } from "react";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { useMap } from "react-leaflet";
import { Layer } from "leaflet";
import { GeoManLayers } from "./interfaces/interfaces";

export default function MapFeatureManager() {
	const [firstRender, setFirstRender] = useState(true);
	const drawnLayersRef = useRef<GeoManLayers[]>([]);
	const editedLayersRef = useRef<Layer[]>([]);
	const leafletContainer = useMap();

	const configureControls = () => {
		leafletContainer.pm.addControls({
			draw: true,
			editMode: true,
			position: "topright",
		});
	};

	const clearDrawnFeatures = () => {
		leafletContainer.pm.getGeomanLayers().forEach((layer) => {
			leafletContainer.removeLayer(layer);
		});
	};

	useEffect(() => {
		clearDrawnFeatures();
	}, []);

	useEffect(() => {
		configureControls();

		if (!firstRender) {
			drawnLayersRef.current = [];
			clearDrawnFeatures();
			return;
		}

		setFirstRender(false);

		leafletContainer.on("pm:create", (e) => {
			const layer = e.layer as GeoManLayers;
			if (!drawnLayersRef.current.some((l) => l._leaflet_id === layer._leaflet_id)) {
				layer._shape = e.shape;
				drawnLayersRef.current.push(layer);
				layer.on("pm:update", () => {
          //
        });
			}
		});

		leafletContainer.on("pm:remove", (e) => {
			drawnLayersRef.current = drawnLayersRef.current.filter(
				(layer) => layer !== e.layer
			);
		});

		return () => leafletContainer.pm.removeControls();
	}, []);

	// useEffect(() => {
	// 	drawnLayersRef.current.forEach((layer) => {
	// 		const shapeId = layer._leaflet_id;
	// 		const properties = newFeatureProperties[shapeId!];
	// 		const fillColor = properties?.fillColor || "#3388ff";
	// 		const strokeColor = properties?.strokeColor || "#3388ff";

	// 		layer.setStyle?.({
	// 			fillColor,
	// 			color: strokeColor,
	// 		});
	// 	});
	// }, [newFeatureProperties]);

	// useEffect(() => {
	// 	const layers = Object.values(featureLeafletContextMap);
	// 	editedLayersRef.current = layers as Layer[];

	// 	editedLayersRef.current.forEach((layer) => {
	// 		layer.on("pm:update", () => {});
	// 		layer.on("pm:remove", () => {});
	// 	});
	// }, [featureLeafletContextMap]);

	return null;
}
