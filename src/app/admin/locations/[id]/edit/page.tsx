"use client";

import { use, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Save } from "lucide-react";
import {
  PageHeader,
  Card,
  LoadingState,
  LocationForm,
  LocationFormValues,
  LocationFormCategory,
  defaultLocationFormValues,
} from "@/components/Admin";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";

export const runtime = 'edge';

export default function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*, subcategories(*)");

    if (error) throw error;
    return (data || []) as LocationFormCategory[];
  }, []);

  const { data: categoriesData, loading: categoriesLoading } =
    useSupabaseQuery<LocationFormCategory[]>(fetchCategories);
  const categories = categoriesData || [];

  const fetchLocation = useCallback(async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("*, location_images(image_url)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }, [id]);

  const { data: locationData, loading: locationLoading } =
    useSupabaseQuery(fetchLocation);

  const initialValues = useMemo<LocationFormValues>(() => {
    if (!locationData) return defaultLocationFormValues;

    return {
      name: locationData.name,
      category_id: locationData.category_id || "",
      subcategory_id: locationData.subcategory_id || "",
      latitude: locationData.latitude?.toString() || "",
      longitude: locationData.longitude?.toString() || "",
      address: locationData.address || "",
      dusun: locationData.dusun || "",
      contact: locationData.contact || "",
      description: locationData.description || "",
      condition: locationData.condition || "Baik",
      images:
        locationData.location_images?.map(
          (img: { image_url: string }) => img.image_url
        ) || [],
    };
  }, [locationData]);

  const handleSubmit = async (values: LocationFormValues) => {
    setSaving(true);

    try {
      const { error: locationError } = await supabase
        .from("locations")
        .update({
          name: values.name,
          category_id: values.category_id || null,
          subcategory_id: values.subcategory_id || null,
          latitude: parseFloat(values.latitude),
          longitude: parseFloat(values.longitude),
          address: values.address,
          dusun: values.dusun,
          contact: values.contact,
          description: values.description,
          condition: values.condition,
        })
        .eq("id", id);

      if (locationError) throw locationError;

      const { error: deleteError } = await supabase
        .from("location_images")
        .delete()
        .eq("location_id", id);

      if (deleteError) throw deleteError;

      if (values.images.length > 0) {
        const imageInserts = values.images.map((url) => ({
          location_id: id,
          image_url: url,
        }));

        const { error: insertError } = await supabase
          .from("location_images")
          .insert(imageInserts);

        if (insertError) throw insertError;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Gagal memperbarui lokasi.");
    } finally {
      setSaving(false);
    }
  };

  if (categoriesLoading || locationLoading || !locationData) {
    return <LoadingState />;
  }

  return (
    <div>
      <PageHeader
        title="Edit Lokasi"
        description="Perbarui informasi lokasi."
        backHref="/admin"
      />

      <Card className="max-w-3xl">
        <LocationForm
          initialValues={initialValues}
          categories={categories}
          onSubmit={handleSubmit}
          submitting={saving}
          submitLabel="Simpan Perubahan"
          submittingLabel="Menyimpan..."
          submitIcon={<Save className="w-4 h-4" />}
          cancelHref="/admin"
        />
      </Card>
    </div>
  );
}
