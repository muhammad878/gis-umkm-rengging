"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Save, Plus, Trash2 } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  FormField,
  Input,
  IconButton,
} from "@/components/Admin";

export const runtime = 'edge';

interface Subcategory {
  id: string;
  name: string;
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState({ name: "", icon: "" });
  const [newSubcategory, setNewSubcategory] = useState("");

  useEffect(() => {
    Promise.all([fetchCategory(), fetchSubcategories()]);
  }, [id]);

  const fetchCategory = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({ name: data.name, icon: data.icon || "" });
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      alert("Gagal memuat data kategori.");
      router.push("/admin/categories");
    }
  };

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", id)
        .order("created_at", { ascending: true });

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("categories")
        .update({ name: formData.name, icon: formData.icon || null })
        .eq("id", id);

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
        .from("subcategories")
        .insert([{ category_id: id, name: newSubcategory }]);

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
        .from("subcategories")
        .delete()
        .eq("id", subId);

      if (error) throw error;
      fetchSubcategories();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      alert("Gagal menghapus subkategori.");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit Kategori"
        description="Perbarui detail kategori dan kelola subkategori."
        backHref="/admin/categories"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Category Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Informasi Kategori" />
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <FormField label="Nama Kategori" required>
                <Input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Icon">
                <Input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  placeholder="Nama icon dari Lucide"
                />
              </FormField>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Subcategories */}
        <div>
          <Card>
            <CardHeader title="Subkategori" />
            <div className="p-6">
              <form onSubmit={handleAddSubcategory} className="flex gap-2 mb-6">
                <Input
                  type="text"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder="Nama subkategori..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newSubcategory.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </form>

              <div className="space-y-2">
                {subcategories.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-6">
                    Belum ada subkategori.
                  </p>
                ) : (
                  subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm text-gray-700 font-medium">
                        {sub.name}
                      </span>
                      <IconButton
                        variant="danger"
                        onClick={() => handleDeleteSubcategory(sub.id)}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
