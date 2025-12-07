"use client";

import { useCallback, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Folder,
  ClipboardList,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import {
  PageHeader,
  Card,
  CardHeader,
  EmptyState,
  LoadingState,
  LinkButton,
  Badge,
  ConfirmIconButton,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  Input,
  Select,
} from "@/components/Admin";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  condition: string | null;
  category: {
    name: string;
  } | null;
  created_at: string;
  updated_at?: string;
}

export default function AdminDashboard() {
  interface DashboardStats {
    totalLocations: number;
    totalCategories: number;
    pendingReports: number;
  }

  interface DashboardData {
    locations: Location[];
    categories: { id: string; name: string }[];
    stats: DashboardStats;
  }

  const fetchDashboardData = useCallback(async () => {
    const locationsPromise = supabase
      .from("locations")
      .select(
        `
        id,
        name,
        latitude,
        longitude,
        condition,
        created_at,
        updated_at,
        category:categories(name)
      `
      )
      .order("updated_at", { ascending: false });

    const categoryCountPromise = supabase
      .from("categories")
      .select("*", { count: "exact", head: true });

    const categoriesListPromise = supabase
      .from("categories")
      .select("id, name")
      .order("name");

    const pendingReportCountPromise = supabase
      .from("location_reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const [locationsRes, categoriesRes, reportsRes, categoriesListRes] = await Promise.all([
      locationsPromise,
      categoryCountPromise,
      pendingReportCountPromise,
      categoriesListPromise,
    ]);

    if (locationsRes.error) throw locationsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;
    if (reportsRes.error) throw reportsRes.error;
    if (categoriesListRes.error) throw categoriesListRes.error;

    const formattedLocations = (locationsRes.data || []).map((item) => ({
      ...item,
      category: Array.isArray(item.category) ? item.category[0] : item.category,
    }));

    return {
      locations: formattedLocations,
      categories: categoriesListRes.data || [],
      stats: {
        totalLocations:
          locationsRes.count ?? formattedLocations.length ?? 0,
        totalCategories: categoriesRes.count ?? 0,
        pendingReports: reportsRes.count ?? 0,
      },
    } as DashboardData;
  }, []);

  const { data, loading, refetch } =
    useSupabaseQuery<DashboardData>(fetchDashboardData);

  const locations = data?.locations || [];
  const categories = data?.categories || [];
  const stats = data?.stats || {
    totalLocations: 0,
    totalCategories: 0,
    pendingReports: 0,
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch = location.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory
        ? location.category?.name === filterCategory
        : true;
      const matchesCondition = filterCondition
        ? location.condition === filterCondition
        : true;

      return matchesSearch && matchesCategory && matchesCondition;
    });
  }, [locations, searchQuery, filterCategory, filterCondition]);

  const statCards = useMemo(
    () => [
      {
        label: "Total Lokasi",
        value: stats.totalLocations,
        icon: MapPin,
        accent: "text-blue-600 bg-blue-50",
      },
      {
        label: "Kategori",
        value: stats.totalCategories,
        icon: Folder,
        accent: "text-purple-600 bg-purple-50",
      },
      {
        label: "Laporan Pending",
        value: stats.pendingReports,
        icon: ClipboardList,
        accent: "text-amber-600 bg-amber-50",
      },
    ],
    [stats]
  );

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("locations").delete().eq("id", id);

      if (error) throw error;
      await refetch();
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Gagal menghapus lokasi.");
    }
  };

  const getConditionBadge = (condition: string | null) => {
    switch (condition) {
      case "Baik":
        return <Badge variant="green">Baik</Badge>;
      case "Rusak Ringan":
        return <Badge variant="yellow">Rusak Ringan</Badge>;
      case "Rusak Berat":
        return <Badge variant="red">Rusak Berat</Badge>;
      default:
        return <Badge variant="gray">-</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Dashboard Admin"
        description="Kelola data spasial dan informasi infrastruktur desa."
        action={
          <div className="flex gap-3">
            <LinkButton href="/admin/categories" variant="secondary">
              <Folder className="w-4 h-4" />
              Kategori
            </LinkButton>
            <LinkButton href="/admin/locations/create">
              <Plus className="w-4 h-4" />
              Tambah Lokasi
            </LinkButton>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {statCards.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div
              className={`p-3 rounded-2xl ${accent} flex items-center justify-center`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Daftar Lokasi"
          action={
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium text-gray-900">
                {filteredLocations.length}
              </span>{" "}
              lokasi ditemukan
            </div>
          }
        />

        <div className="p-5 border-b border-gray-100 bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari lokasi..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </Select>
          <Select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
          >
            <option value="">Semua Kondisi</option>
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </Select>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredLocations.length === 0 ? (
          <EmptyState
            icon={<MapPin className="w-7 h-7 text-blue-600" />}
            title="Belum ada data lokasi"
            description="Mulai dengan menambahkan lokasi baru untuk dipetakan."
          />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Nama Lokasi</TableHeader>
                <TableHeader>Kategori</TableHeader>
                <TableHeader>Kondisi</TableHeader>
                <TableHeader>Koordinat</TableHeader>
                <TableHeader>Terakhir Diperbarui</TableHeader>
                <TableHeader className="text-right">Aksi</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {filteredLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium text-gray-900">
                    {location.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="blue">
                      {location.category?.name || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getConditionBadge(location.condition)}</TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">
                    {location.latitude.toFixed(5)},{" "}
                    {location.longitude.toFixed(5)}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(location.updated_at || location.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/locations/${location.id}/edit`}>
                        <IconButton>
                          <Edit className="w-4 h-4" />
                        </IconButton>
                      </Link>
                      <ConfirmIconButton
                        variant="danger"
                        confirmMessage="Apakah Anda yakin ingin menghapus lokasi ini?"
                        onConfirm={() => handleDelete(location.id)}
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
