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
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleLayers, setVisibleLayers] = useState<string[]>([
    'boundary',
    'roads',
    'rivers',
    'riceFields',
    'facilities'
  ]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if Supabase is properly configured
        const supabaseUrl = (supabase as any)['supabaseUrl'] as string;
        const isDefaultOrDemo = !supabaseUrl ||
          supabaseUrl.includes('placeholder') ||
          supabaseUrl.includes('demo.supabase.co') ||
          supabaseUrl === 'https://your-project.supabase.co';

        // Initialize with default categories for local facilities
        const localCategories: Category[] = [
          {
            id: 'government',
            name: 'Pemerintahan',
            subcategories: [{ id: 'gov-office', name: 'Kantor Desa' }]
          },
          {
            id: 'education',
            name: 'Pendidikan',
            subcategories: [{ id: 'school', name: 'Sekolah/Pendidikan' }]
          },
          {
            id: 'worship',
            name: 'Sarana Ibadah',
            subcategories: [{ id: 'masjid', name: 'Masjid/Musholla' }]
          }
        ];

        // Fetch facility GeoJSONs
        const fetchGeoJSON = async (url: string) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.json();
          } catch (e) {
            return null;
          }
        };

        const [govGeo, eduGeo, worshipGeo] = await Promise.all([
          fetchGeoJSON('/data/government_facilities.geojson'),
          fetchGeoJSON('/data/education_facilities.geojson'),
          fetchGeoJSON('/data/worship_facilities.geojson'),
        ]);

        const mapFacilityToLocation = (geoJson: any, categoryId: string, subcategoryId: string, color: string): Location[] => {
          if (!geoJson || !geoJson.features) return [];
          return geoJson.features.map((f: any, i: number) => ({
            id: `${categoryId}-${i}`,
            name: f.properties.NAMOBJ || f.properties.REMARK || categoryId,
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
            category_id: categoryId,
            subcategory_id: subcategoryId,
            description: f.properties.REMARK || `Fasilitas ${categoryId}`,
            color: color,
            condition: "Baik",
            address: "Desa Rengging"
          }));
        };

        const localLocations = [
          ...mapFacilityToLocation(govGeo, 'government', 'gov-office', '#dc2626'),
          ...mapFacilityToLocation(eduGeo, 'education', 'school', '#2563eb'),
          ...mapFacilityToLocation(worshipGeo, 'worship', 'masjid', '#059669'),
        ];

        if (isDefaultOrDemo) {
          console.warn('⚠️ Supabase not configured. Running with local geographic data.');
          setLocations(localLocations);
          setCategories(localCategories);
          setLoading(false);
          return;
        }

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

        setLocations([...localLocations, ...formattedLocations]);
        setCategories([...localCategories, ...(categoriesRes.data || [])]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLocations([]);
        setCategories([]);
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

        return matchesSearch && matchesCategory;
      })
      .map((loc) => ({
        ...loc,
        color:
          (loc.category_id && categoryColorMap[loc.category_id]) || "#3b82f6",
      }));
  }, [
    locations,
    selectedSubcategories,
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
        loading={loading}
        currentView={currentView}
        currentStyle={mapStyle}
        onStyleChange={setMapStyle}
        isOpen={controlPanelOpen}
        onOpenChange={setControlPanelOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLocationClick={handleLocationClick}
        visibleLayers={visibleLayers}
        onVisibleLayersChange={setVisibleLayers}
      />

      <div className="absolute left-0 right-0 top-0 bottom-16 md:left-16 md:bottom-0">
        <Map
          locations={filteredLocations}
          mapStyle={mapStyle}
          selectedLocation={selectedLocation}
          onFlyComplete={handleFlyComplete}
          onLocationClick={handleLocationClick}
          visibleLayers={visibleLayers}
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
