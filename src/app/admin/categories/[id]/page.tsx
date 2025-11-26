"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ChevronLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Subcategory {
    id: string;
    name: string;
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        icon: ""
    });

    const [newSubcategory, setNewSubcategory] = useState("");

    useEffect(() => {
        Promise.all([fetchCategory(), fetchSubcategories()]);
    }, [id]);

    const fetchCategory = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    name: data.name,
                    icon: data.icon || ""
                });
            }
        } catch (error) {
            console.error("Error fetching category:", error);
            alert("Gagal memuat data kategori.");
            router.push('/admin/categories');
        }
    };

    const fetchSubcategories = async () => {
        try {
            const { data, error } = await supabase
                .from('subcategories')
                .select('*')
                .eq('category_id', id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) setSubcategories(data);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('categories')
                .update({
                    name: formData.name,
                    icon: formData.icon || null
                })
                .eq('id', id);

            if (error) throw error;

            alert("Kategori berhasil diperbarui.");
        } catch (error) {
            console.error("Error updating category:", error);
            alert("Gagal memperbarui kategori.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddSubcategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubcategory.trim()) return;

        try {
            const { error } = await supabase
                .from('subcategories')
                .insert([{
                    category_id: id,
                    name: newSubcategory
                }]);

            if (error) throw error;

            setNewSubcategory("");
            fetchSubcategories();
        } catch (error) {
            console.error("Error adding subcategory:", error);
            alert("Gagal menambahkan subkategori.");
        }
    };

    const handleDeleteSubcategory = async (subId: string) => {
        if (!confirm("Hapus subkategori ini?")) return;

        try {
            const { error } = await supabase
                .from('subcategories')
                .delete()
                .eq('id', subId);

            if (error) throw error;

            fetchSubcategories();
        } catch (error) {
            console.error("Error deleting subcategory:", error);
            alert("Gagal menghapus subkategori.");
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat data...</div>;
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/categories" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Kategori</h1>
                    <p className="text-gray-500 mt-1">Perbarui detail kategori dan kelola subkategori.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Edit Category Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Informasi Kategori</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nama Kategori <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Icon (Opsional)</label>
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Subcategories Management */}
                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Subkategori</h2>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleAddSubcategory} className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newSubcategory}
                                    onChange={(e) => setNewSubcategory(e.target.value)}
                                    placeholder="Nama subkategori..."
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!newSubcategory.trim()}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </form>

                            <div className="space-y-2">
                                {subcategories.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic text-center py-4">Belum ada subkategori.</p>
                                ) : (
                                    subcategories.map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                                            <span className="text-sm text-gray-700 font-medium">{sub.name}</span>
                                            <button
                                                onClick={() => handleDeleteSubcategory(sub.id)}
                                                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
