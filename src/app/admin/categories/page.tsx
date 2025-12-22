"use client";

import { useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit, Trash2, Layers } from "lucide-react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  CardHeader,
  EmptyState,
  LoadingState,
  LinkButton,
  Badge,
  IconButton,
  ConfirmIconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/Admin";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  subcategories: { count: number }[];
}

export default function CategoriesPage() {
  const fetchCategories = useCallback(async () => {
    // Check if Supabase is properly configured
    const supabaseUrl = (supabase as any)['supabaseUrl'] as string;
    const isDefaultOrDemo = !supabaseUrl ||
      supabaseUrl.includes('placeholder') ||
      supabaseUrl.includes('demo.supabase.co') ||
      supabaseUrl === 'https://your-project.supabase.co';

    if (isDefaultOrDemo) {
      return [];
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*, subcategories(count)");

    if (error) throw error;
    return data || [];
  }, []);

  const {
    data: categoriesData,
    loading,
    refetch,
  } = useSupabaseQuery<Category[]>(fetchCategories);
  const categories = categoriesData || [];

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;
      await refetch();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Gagal menghapus kategori.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Kelola Kategori"
        description="Atur kategori dan subkategori untuk lokasi."
        backHref="/admin"
        action={
          <LinkButton href="/admin/categories/create">
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </LinkButton>
        }
      />

      <Card>
        <CardHeader title="Daftar Kategori" />

        {loading ? (
          <LoadingState />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-7 h-7 text-blue-600" />}
            title="Belum ada kategori"
            description="Tambahkan kategori baru untuk mulai mengelompokkan lokasi."
          />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Nama Kategori</TableHeader>
                <TableHeader>Icon</TableHeader>
                <TableHeader>Subkategori</TableHeader>
                <TableHeader className="text-right">Aksi</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium text-gray-900">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">
                    {category.icon || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="gray">
                      {category.subcategories[0]?.count || 0} subkategori
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/categories/${category.id}`}>
                        <IconButton>
                          <Edit className="w-4 h-4" />
                        </IconButton>
                      </Link>
                      <ConfirmIconButton
                        variant="danger"
                        confirmMessage="Apakah Anda yakin ingin menghapus kategori ini? Semua subkategori terkait akan ikut terhapus."
                        onConfirm={() => handleDelete(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </ConfirmIconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
