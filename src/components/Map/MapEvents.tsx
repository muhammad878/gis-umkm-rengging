"use client";

import { useEffect, useRef } from "react";
import { useMapEvents } from "react-leaflet";

interface MapEventsProps {
  onZoomChange: (zoom: number) => void;
  onClick?: (latlng: { lat: number; lng: number }) => void;
}

export const MapEvents = ({ onZoomChange, onClick }: MapEventsProps) => {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const map = useMapEvents({
    zoomend: () => {
      if (mountedRef.current) {
        try {
          onZoomChange(map.getZoom());
        } catch {
          // Ignore errors
        }
      }
    },
    click: (e) => {
      if (mountedRef.current && onClick) {
        onClick(e.latlng);
      }
    },
  });

  return null;
};
