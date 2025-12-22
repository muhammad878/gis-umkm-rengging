"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Save, Store, Tag, MapPin, Phone } from 'lucide-react';

interface AddUMKMModalProps {
    isOpen: boolean;
    onClose: () => void;
    latlng: { lat: number; lng: number } | null;
    onSuccess: () => void;
}

export const AddUMKMModal = ({ isOpen, onClose, latlng, onSuccess }: AddUMKMModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_usaha: '',
        kategori: 'Kuliner',
        deskripsi: '',
        alamat: '',
        no_whatsapp: '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!latlng) return;

        // Check if Supabase is properly configured
        const supabaseUrl = (supabase as any)['supabaseUrl'] as string;
        const isDefaultOrDemo = !supabaseUrl ||
            supabaseUrl.includes('placeholder') ||
            supabaseUrl.includes('demo.supabase.co') ||
            supabaseUrl === 'https://your-project.supabase.co';

        if (isDefaultOrDemo) {
            alert('Fitur ini memerlukan konfigurasi Supabase yang valid. Silakan hubungi admin.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.rpc('create_umkm_with_coords', {
                p_nama: formData.nama_usaha,
                p_kategori: formData.kategori,
                p_deskripsi: formData.deskripsi,
                p_alamat: formData.alamat,
                p_wa: formData.no_whatsapp,
                p_lat: latlng.lat,
                p_long: latlng.lng,
                p_foto: '' // Placeholder for now
            });

            if (error) throw error;

            alert('UMKM berhasil ditambahkan!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error adding UMKM:', error.message);
            alert('Gagal menambah UMKM: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Store className="w-5 h-5 text-blue-600" />
                        Tambah UMKM Baru
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Usaha</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                required
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Contoh: Warung Barokah"
                                value={formData.nama_usaha}
                                onChange={(e) => setFormData({ ...formData, nama_usaha: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <select
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                value={formData.kategori}
                                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                            >
                                <option>Kuliner</option>
                                <option>Kerajinan</option>
                                <option>Jasa</option>
                                <option>Pertanian</option>
                                <option>Lainnya</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                required
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Alamat lengkap"
                                value={formData.alamat}
                                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                required
                                type="tel"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="628123xxx"
                                value={formData.no_whatsapp}
                                onChange={(e) => setFormData({ ...formData, no_whatsapp: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                            placeholder="Apa yang dijual atau jasa apa yang ditawarkan?"
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Menyimpan...' : 'Simpan Lokasi UMKM'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
