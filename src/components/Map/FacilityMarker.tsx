import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMemo } from 'react';

interface FacilityMarkerProps {
    feature: any;
    type: 'government' | 'education' | 'worship';
}

// Custom icon configurations
const ICON_CONFIGS = {
    government: {
        html: `<div style="background: #dc2626; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
      <span style="font-size: 20px;">🏛️</span>
    </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    },
    education: {
        html: `<div style="background: #2563eb; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
      <span style="font-size: 20px;">🏫</span>
    </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    },
    worship: {
        html: `<div style="background: #059669; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
      <span style="font-size: 20px;">🕌</span>
    </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    },
};

export const FacilityMarker = ({ feature, type }: FacilityMarkerProps) => {
    const position: [number, number] = useMemo(() => {
        const coords = feature.geometry.coordinates;
        return [coords[1], coords[0]]; // [lat, lng]
    }, [feature]);

    const icon = useMemo(() => {
        const config = ICON_CONFIGS[type];
        return L.divIcon({
            html: config.html,
            iconSize: config.iconSize as [number, number],
            iconAnchor: config.iconAnchor as [number, number],
            className: 'custom-facility-marker',
        });
    }, [type]);

    const name = feature.properties.NAMOBJ || feature.properties.REMARK || 'Unknown';

    return (
        <Marker position={position} icon={icon}>
            <Popup>
                <div className="p-2">
                    <h3 className="font-bold text-sm mb-1">{name}</h3>
                    <p className="text-xs text-gray-600">
                        {type === 'government' && 'Fasilitas Pemerintahan'}
                        {type === 'education' && 'Fasilitas Pendidikan'}
                        {type === 'worship' && 'Tempat Ibadah'}
                    </p>
                </div>
            </Popup>
        </Marker>
    );
};
