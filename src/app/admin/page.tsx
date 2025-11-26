"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import Link from "next/link";

interface Location {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    category: {
        name: string;
    } | null;
    created_at: string;
}

export default function AdminDashboard() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const { data, error } = await supabase
                .from('locations')
                .select(`
                    id,
                    name,
                    latitude,
                    longitude,
                    created_at,
                    category:categories(name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Transform data to match interface if needed (Supabase returns array for joined tables sometimes)
                const formattedData = data.map(item => ({
                    ...item,
                    category: Array.isArray(item.category) ? item.category[0] : item.category
                }));
                setLocations(formattedData);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus lokasi ini?")) return;

        try {
            const { error } = await supabase
                .from('locations')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Refresh list
            fetchLocations();
        } catch (error) {
            console.error("Error deleting location:", error);
            alert("Gagal menghapus lokasi.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                    <p className="text-gray-500 mt-1">Kelola data spasial dan informasi infrastruktur.</p>
                </div>
                <Link href="/admin/locations/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    Tambah Lokasi
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Daftar Lokasi</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Memuat data...</div>
                ) : locations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">Belum ada data lokasi</h3>
                        <p className="text-gray-500 text-sm">Mulai dengan menambahkan lokasi baru.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Nama Lokasi</th>
                                    <th className="px-6 py-3">Kategori</th>
                                    <th className="px-6 py-3">Koordinat</th>
                                    <th className="px-6 py-3">Tanggal Dibuat</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {locations.map((location) => (
                                    <tr key={location.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{location.name}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                                                {location.category?.name || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(location.created_at).toLocaleDateString("id-ID", {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/locations/${location.id}/edit`}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(location.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
