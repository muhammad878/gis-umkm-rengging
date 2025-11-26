"use client";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix for default marker icon
const iconRetinaUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png";
const iconUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png";
const shadowUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png";

const Map = () => {
    const [geoJsonData, setGeoJsonData] = useState(null);

    useEffect(() => {
        (async function init() {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl,
                iconUrl,
                shadowUrl,
            });
        })();

        // Fetch GeoJSON data
        fetch("/data/village_boundaries.geojson")
            .then((res) => res.json())
            .then((data) => setGeoJsonData(data))
            .catch((err) => console.error("Error loading GeoJSON:", err));
    }, []);

    return (
        <MapContainer center={[-6.535, 110.74]} zoom={14} scrollWheelZoom={true} zoomControl={false} className="h-full w-full outline-none">
            <ZoomControl position="bottomright" />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {geoJsonData && (
                <GeoJSON
                    data={geoJsonData}
                    style={{
                        fillColor: "#3b82f6",
                        weight: 2,
                        opacity: 1,
                        color: "#2563eb",
                        dashArray: "3",
                        fillOpacity: 0.1
                    }}
                />
            )}


        </MapContainer>
    );
};

export default Map;
