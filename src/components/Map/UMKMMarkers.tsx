"use client";

import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/lib/supabaseClient';
import { Store, Phone, ExternalLink } from 'lucide-react';

const umkmIcon = new L.Icon({
    iconUrl: '/markers/umkm-marker.png', // Fallback to a custom or generated icon
    iconRetinaUrl: '/markers/umkm-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Since we might not have the image yet, let's use a div-based icon
const createCustomIcon = (kategori: string) => {
    let color = '#3b82f6'; // Blue
    if (kategori === 'Kuliner') color = '#ef4444'; // Red
    if (kategori === 'Kerajinan') color = '#f59e0b'; // Amber
    if (kategori === 'Jasa') color = '#10b981'; // Emerald

    return L.divIcon({
        html: `
            <div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
                <div style="transform: rotate(45deg); color: white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
            </div>
        `,
        className: 'custom-umkm-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
};

export const UMKMMarkers = ({ refreshKey }: { refreshKey: number }) => {
    const [umkms, setUmkms] = useState<any[]>([]);

    useEffect(() => {
        const fetchUMKM = async () => {
            // Check if Supabase is properly configured
            const supabaseUrl = (supabase as any)['supabaseUrl'] as string;
            const isDefaultOrDemo = !supabaseUrl ||
                supabaseUrl.includes('placeholder') ||
                supabaseUrl.includes('demo.supabase.co') ||
                supabaseUrl === 'https://your-project.supabase.co';

            if (isDefaultOrDemo) {
                return;
            }

            const { data, error } = await supabase
                .from('umkm')
                .select('*');

            if (error) {
                console.error('Error fetching UMKM:', error);
            } else {
                setUmkms(data || []);
            }
        };

        fetchUMKM();
    }, [refreshKey]);

    return (
        <>
            {umkms.map((umkm) => {
                // Parse geometry point string from Supabase (e.g. "POINT(long lat)")
                // Note: PostGIS usually stores as (Long Lat)
                // If using rpc it might come differently, but select * on geometry returns EWKB or a string depending on client
                // For simplicity, let's assume we might need a processing step or Supabase returns it as geojson if configured

                // If we get "0101000020E6100000..." hex, we need to decode. 
                // However, Supabase often returns simpler objects if used with PostgREST.
                // Let's assume we saved it and we'll fetch it as coordinates if possible or parse the string.

                // Fallback: If 'lokasi' is a string like "POINT(110.123 -7.123)"
                let position: [number, number] = [0, 0];
                if (typeof umkm.lokasi === 'string') {
                    const coords = umkm.lokasi.match(/-?\d+\.\d+/g);
                    if (coords && coords.length >= 2) {
                        position = [parseFloat(coords[1]), parseFloat(coords[0])]; // [Lat, Long]
                    }
                } else if (umkm.lokasi?.coordinates) {
                    position = [umkm.lokasi.coordinates[1], umkm.lokasi.coordinates[0]];
                }

                if (position[0] === 0) return null;

                return (
                    <Marker
                        key={umkm.id}
                        position={position}
                        icon={createCustomIcon(umkm.kategori)}
                    >
                        <Popup>
                            <div className="min-w-[200px] p-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Store className="w-4 h-4 text-blue-600" />
                                    <h3 className="font-bold text-gray-900 m-0">{umkm.nama_usaha}</h3>
                                </div>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 mb-2 uppercase">
                                    {umkm.kategori}
                                </span>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{umkm.deskripsi}</p>

                                <div className="space-y-2 border-t pt-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone className="w-3 h-3" />
                                        <span>{umkm.no_whatsapp}</span>
                                    </div>
                                    <a
                                        href={`https://wa.me/${umkm.no_whatsapp}`}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Hubungi WhatsApp
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
};
