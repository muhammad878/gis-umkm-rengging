"use client";

import { Location, Category } from "@/types";
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import ControlPanel from "@/components/ControlPanel";
import { CATEGORY_COLORS, ViewType } from "@/constants";
import { LocationDetailPanel } from "@/components/LocationDetailPanel";

// Lazy load Map component
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      Loading Map...
    </div>
  ),
});

export default function Home() {
  // Data state
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [mapStyle, setMapStyle] = useState("light");
  const [controlPanelOpen, setControlPanelOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>("layers");
  const [forceOpenCounter, setForceOpenCounter] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  // Filter state
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [locationsRes, categoriesRes] = await Promise.all([
          supabase.from("locations").select("*, location_images(image_url), updated_at"),
          supabase.from("categories").select("*, subcategories(*)"),
        ]);

        if (locationsRes.error) throw locationsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        const formattedLocations = (locationsRes.data || []).map((loc: any) => ({
          ...loc,
          images: loc.location_images?.map((img: any) => img.image_url) || [],
        }));

        setLocations(formattedLocations);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Category color mapping
  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat, index) => {
      map[cat.id] = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
    });
    return map;
  }, [categories]);

  // Filtered locations with colors
  const filteredLocations = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return locations
      .filter((loc) => {
        const matchesSearch =
          query === "" ||
          loc.name?.toLowerCase().includes(query) ||
          loc.description?.toLowerCase().includes(query) ||
          loc.address?.toLowerCase().includes(query);

        const matchesCategory =
          selectedSubcategories.length === 0 ||
          (loc.subcategory_id &&
            selectedSubcategories.includes(loc.subcategory_id)) ||
          (!loc.subcategory_id &&
            loc.category_id &&
            selectedSubcategories.includes(loc.category_id));

        const matchesCondition =
          selectedConditions.length === 0 ||
          (loc.condition && selectedConditions.includes(loc.condition));

        return matchesSearch && matchesCategory && matchesCondition;
      })
      .map((loc) => ({
        ...loc,
        color:
          (loc.category_id && categoryColorMap[loc.category_id]) || "#3b82f6",
      }));
  }, [
    locations,
    selectedSubcategories,
    selectedConditions,
    searchQuery,
    categoryColorMap,
  ]);

  // Handlers
  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  const handlePanelOpen = useCallback(() => {
    setForceOpenCounter((prev) => prev + 1);
  }, []);

  const handleLocationClick = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  const handleFlyComplete = useCallback(() => {
    // Optional: Clear selection after flying completes
    // setSelectedLocation(null);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-50 relative">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onPanelOpen={handlePanelOpen}
        isPanelOpen={controlPanelOpen}
        onPanelToggle={setControlPanelOpen}
      />

      <ControlPanel
        categories={categories}
        locations={filteredLocations}
        allLocations={locations}
        selectedSubcategories={selectedSubcategories}
        onSubcategoriesChange={setSelectedSubcategories}
        selectedConditions={selectedConditions}
        onConditionsChange={setSelectedConditions}
        loading={loading}
        currentView={currentView}
        currentStyle={mapStyle}
        onStyleChange={setMapStyle}
        isOpen={controlPanelOpen}
        onOpenChange={setControlPanelOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLocationClick={handleLocationClick}
      />

      <div className="absolute left-16 top-0 right-0 bottom-0 h-full">
        <Map
          locations={filteredLocations}
          mapStyle={mapStyle}
          selectedLocation={selectedLocation}
          onFlyComplete={handleFlyComplete}
          onLocationClick={handleLocationClick}
        />
      </div>

      {selectedLocation && (
        <LocationDetailPanel
          location={selectedLocation}
          categories={categories}
          onClose={handleCloseDetail}
        />
      )}
    </main>
  );
}
