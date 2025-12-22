"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Location } from "@/types";
import { ChevronLeft, Send, Upload } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Pick<Location, "id" | "name">[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    phone: "",
    location_id: "",
    condition: "",
    image_url: "",
    description: "",
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Check if Supabase is properly configured
        const supabaseUrl = (supabase as any)['supabaseUrl'] as string;
        const isDefaultOrDemo = !supabaseUrl ||
          supabaseUrl.includes('placeholder') ||
          supabaseUrl.includes('demo.supabase.co') ||
          supabaseUrl === 'https://your-project.supabase.co';

        if (isDefaultOrDemo) {
          setLocations([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("locations")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setLocations(data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setSubmitting(true);

    try {
      const { error } = await supabase.from("location_reports").insert([
        {
          ...formData,
          location_id: formData.location_id || null,
          status: "pending",
        },
      ]);

      if (error) throw error;

      alert("Laporan berhasil dikirim! Terima kasih atas kontribusi Anda.");
      router.push("/");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Gagal mengirim laporan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lapor Pembaruan Lokasi
            </h1>
            <p className="text-sm text-gray-500">
              Bantu kami memperbarui data infrastruktur desa
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100">
                Data Pelapor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. HP / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Contoh: 08123456789"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Domisili *
                </label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Alamat lengkap pelapor"
                />
              </div>
            </div>

            {/* Report Details */}
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100">
                Detail Laporan
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi yang Dilaporkan
                </label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">
                    -- Pilih Lokasi (Opsional jika lokasi baru) --
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Biarkan kosong jika melaporkan lokasi yang belum ada di peta.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kondisi / Status Terbaru *
                </label>
                <select
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">-- Pilih Kondisi --</option>
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                  <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Foto Terbaru (URL)
                </label>
                <div className="relative">
                  <Upload className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan link URL gambar (Google Drive, Imgur, dll).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Jelaskan detail perubahan atau kondisi lokasi..."
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  "Mengirim..."
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Laporan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
