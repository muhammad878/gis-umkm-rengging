"use client";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix for default marker icon
const iconRetinaUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png";
const iconUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png";
const shadowUrl = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png";

interface Location {
    id: string;
    name: string;
    latitude: number | string;
    longitude: number | string;
    description?: string;
    category_id?: string;
    subcategory_id?: string;
}

interface MapProps {
    locations?: Location[];
}

const Map = ({ locations = [] }: MapProps) => {
    const [geoJsonData, setGeoJsonData] = useState(null);

    // Custom icon definition
    const customIcon = new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    useEffect(() => {
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

            {locations.map((location) => {
                const lat = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude;
                const lng = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude;

                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                    <Marker key={location.id} position={[lat, lng]} icon={customIcon}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm">{location.name}</h3>
                                {location.description && <p className="text-xs mt-1">{location.description}</p>}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default Map;
