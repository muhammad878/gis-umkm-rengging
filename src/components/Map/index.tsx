"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Location } from "@/types";
import { MAP_CENTER, DEFAULT_ZOOM } from "@/constants";
import type { GeoJsonObject } from "geojson";

// Sub-components
import { MapEvents } from "./MapEvents";
import { FlyToLocation } from "./FlyToLocation";
import { MapTilerController } from "./MapTilerController";
import { LocationMarker } from "./LocationMarker";
import { FacilityMarker } from "./FacilityMarker";
import { GEOJSON_STYLE } from "./constants";
import { useAuth } from "@/hooks/useAuth";
import { AddUMKMModal } from "./AddUMKMModal";
import { UMKMMarkers } from "./UMKMMarkers";

interface MapProps {
    locations?: Location[];
    mapStyle?: string;
    selectedLocation?: Location | null;
    onFlyComplete?: () => void;
    onLocationClick?: (location: Location) => void;
    visibleLayers?: string[];
}

// Safe ZoomControl component
const SafeZoomControl = () => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        let control: any = null;
        let isMounted = true;

        import('leaflet').then((L) => {
            if (!isMounted) return;
            control = L.control.zoom({ position: 'bottomright' });
            control.addTo(map);
        });

        return () => {
            isMounted = false;
            if (control) {
                control.remove();
            }
        };
    }, [map]);

    return null;
};

const Map = ({
    locations = [],
    mapStyle = "light",
    selectedLocation = null,
    onFlyComplete,
    onLocationClick,
    visibleLayers = ['boundary', 'roads', 'rivers', 'riceFields', 'facilities'],
}: MapProps) => {
    const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
    const [roadsData, setRoadsData] = useState<GeoJsonObject | null>(null);
    const [riversData, setRiversData] = useState<GeoJsonObject | null>(null);
    const [riceFieldsData, setRiceFieldsData] = useState<GeoJsonObject | null>(null);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);

    // UMKM Contribution State
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const apiKey = useMemo(() => process.env.NEXT_PUBLIC_MAPTILER_API_KEY, []);

    const handleZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
    }, []);

    const handleMapClick = useCallback((latlng: { lat: number; lng: number }) => {
        if (user) {
            setClickedLatLng(latlng);
            setIsModalOpen(true);
        } else {
            // Optional: Show hint to login
            console.log("Login to add UMKM at", latlng);
        }
    }, [user]);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Fetch GeoJSON data
    useEffect(() => {
        const controller = new AbortController();

        // Load village boundary
        fetch("/data/village_boundaries.geojson", { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => setGeoJsonData(data))
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.error("Error loading village boundary:", err);
                }
            });

        // Load roads
        fetch("/data/roads.geojson", { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => setRoadsData(data))
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.error("Error loading roads:", err);
                }
            });

        // Load rivers
        fetch("/data/rivers.geojson", { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => setRiversData(data))
            .catch((err) => console.log("No rivers found"));

        // Load rice fields
        fetch("/data/rice_fields.geojson", { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => setRiceFieldsData(data))
            .catch((err) => console.log("No rice fields found"));

        return () => controller.abort();
    }, []);

    return (
        <MapContainer
            center={MAP_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={true}
            zoomControl={false}
            className="h-full w-full outline-none"
        >
            <MapEvents onZoomChange={handleZoomChange} onClick={handleMapClick} />
            <FlyToLocation location={selectedLocation} onComplete={onFlyComplete} />

            {apiKey ? (
                <MapTilerController mapStyle={mapStyle} apiKey={apiKey} />
            ) : (
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            )}

            <SafeZoomControl />

            {/* Rice Fields layer (Bottom layer) */}
            {riceFieldsData && visibleLayers.includes('riceFields') && (
                <GeoJSON
                    data={riceFieldsData}
                    style={() => ({
                        color: '#65a30d', // Green border
                        weight: 1,
                        fillColor: '#84cc16', // Light green fill
                        fillOpacity: 0.4,
                    })}
                    onEachFeature={(feature, layer) => {
                        layer.bindPopup(`<div class="p-2 font-semibold">🌾 Area Persawahan</div>`);
                    }}
                />
            )}

            {/* Village boundary */}
            {geoJsonData && visibleLayers.includes('boundary') && <GeoJSON data={geoJsonData} style={GEOJSON_STYLE} />}

            {/* Rivers layer */}
            {riversData && visibleLayers.includes('rivers') && (
                <GeoJSON
                    data={riversData}
                    style={() => ({
                        color: '#0ea5e9', // Sky blue color for rivers
                        weight: 4,
                        opacity: 0.8,
                        lineCap: 'round',
                        lineJoin: 'round'
                    })}
                    onEachFeature={(feature, layer) => {
                        const name = feature.properties.NAMOBJ || feature.properties.REMARK || 'Sungai';
                        layer.bindPopup(`<div class="p-2 font-semibold">🌊 ${name}</div>`);
                    }}
                />
            )}

            {/* Roads layer */}
            {roadsData && visibleLayers.includes('roads') && (
                <GeoJSON
                    data={roadsData}
                    style={(feature) => {
                        const roadType = feature?.properties?.REMARK || '';
                        // Much better styling for visibility
                        if (roadType.includes('Kolektor')) {
                            // Main roads - very thick red
                            return {
                                color: '#dc2626',
                                weight: 6,
                                opacity: 1,
                                lineCap: 'round',
                                lineJoin: 'round'
                            };
                        } else if (roadType.includes('Lokal')) {
                            // Local roads - thick blue
                            return {
                                color: '#1d4ed8',
                                weight: 4.5,
                                opacity: 1,
                                lineCap: 'round',
                                lineJoin: 'round'
                            };
                        } else {
                            // Other roads - medium gray, solid
                            return {
                                color: '#374151',
                                weight: 3,
                                opacity: 0.85,
                                lineCap: 'round',
                                lineJoin: 'round'
                            };
                        }
                    }}
                />
            )}

            {locations.map((location) => (
                <LocationMarker
                    key={location.id}
                    location={location}
                    zoom={zoom}
                    isSelected={selectedLocation?.id === location.id}
                    onClick={onLocationClick}
                />
            ))}

            {/* UMKM Markers from Supabase */}
            <UMKMMarkers refreshKey={refreshKey} />

            {/* UI Modals */}
            <AddUMKMModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                latlng={clickedLatLng}
                onSuccess={handleSuccess}
            />
        </MapContainer>
    );
};

export default Map;
