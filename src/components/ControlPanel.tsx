"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Category, Location } from "@/types";
import {
  SIDEBAR_WIDTH,
  PANEL_WIDTH,
  TOGGLE_BUTTON_SIZE,
  ViewType,
} from "@/constants";
import { LayersView } from "./ControlPanel/LayersView";
import { SettingsView } from "./ControlPanel/SettingsView";
import { AdminSection } from "./ControlPanel/AdminSection";
import { ListView } from "./ControlPanel/ListView";
import { StatisticsView } from "./ControlPanel/StatisticsView";

// Panel header configuration
const PANEL_HEADERS: Record<ViewType, { title: string; subtitle: string }> = {
  layers: { title: "SIG Jambu Timur", subtitle: "Infrastruktur & Fasilitas" },
  list: { title: "Daftar Lokasi", subtitle: "Detail Infrastruktur" },
  statistics: { title: "Statistik Desa", subtitle: "Data & Informasi" },
  admin: { title: "Admin", subtitle: "Status & Akses" },
  settings: { title: "Pengaturan Peta", subtitle: "Tampilan & Gaya" },
};

interface ControlPanelProps {
  categories: Category[];
  locations: Location[];
  allLocations?: Location[]; // Added allLocations prop
  selectedSubcategories: string[];
  onSubcategoriesChange: (subcategories: string[]) => void;
  selectedConditions: string[];
  onConditionsChange: (conditions: string[]) => void;
  loading: boolean;
  currentView?: ViewType;
  currentStyle?: string;
  onStyleChange?: (style: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onLocationClick?: (location: Location) => void;
}

const ControlPanel = ({
  categories,
  locations,
  allLocations,
  selectedSubcategories,
  onSubcategoriesChange,
  selectedConditions,
  onConditionsChange,
  loading,
  currentView = "layers",
  currentStyle = "streets",
  onStyleChange,
  isOpen,
  onOpenChange,
  searchQuery = "",
  onSearchChange,
  onLocationClick,
}: ControlPanelProps) => {
  // Internal state removed, using controlled isOpen prop

  const handleToggle = useCallback(() => {
    onOpenChange(!isOpen);
  }, [isOpen, onOpenChange]);

  const handleSubcategoryChange = useCallback(
    (id: string) => {
      const updated = selectedSubcategories.includes(id)
        ? selectedSubcategories.filter((item) => item !== id)
        : [...selectedSubcategories, id];
      onSubcategoriesChange(updated);
    },
    [selectedSubcategories, onSubcategoriesChange]
  );

  const handleConditionChange = useCallback(
    (condition: string) => {
      const updated = selectedConditions.includes(condition)
        ? selectedConditions.filter((item) => item !== condition)
        : [...selectedConditions, condition];
      onConditionsChange(updated);
    },
    [selectedConditions, onConditionsChange]
  );

  const handleReset = useCallback(() => {
    onSubcategoriesChange([]);
    onConditionsChange([]);
    onSearchChange?.("");
  }, [onSubcategoriesChange, onConditionsChange, onSearchChange]);

  // Calculate toggle button position
  const toggleButtonLeft = useMemo(
    () => (isOpen ? SIDEBAR_WIDTH + PANEL_WIDTH : SIDEBAR_WIDTH),
    [isOpen]
  );

  const header = PANEL_HEADERS[currentView];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="fixed ml-2 top-4 p-2.5 bg-blue-600 text-white border-2 border-blue-700 rounded-lg shadow-lg hover:bg-blue-700 transition-all z-[1000] cursor-pointer"
        style={{
          minWidth: `${TOGGLE_BUTTON_SIZE}px`,
          minHeight: `${TOGGLE_BUTTON_SIZE}px`,
          left: `${toggleButtonLeft}px`,
          transition: "left 0.3s ease-in-out",
        }}
        aria-label={isOpen ? "Tutup panel" : "Buka panel"}
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Panel Container */}
      <div
        className={`${isOpen ? "w-64" : "w-0"
          } fixed left-16 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40 shadow-lg transition-all duration-300 overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900 whitespace-nowrap">
            {header.title}
          </h1>
          <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
            {header.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="p-3 overflow-y-auto flex-1">
          {currentView === "layers" && (
            <LayersView
              categories={categories}
              locations={allLocations || locations} // Use allLocations if available, fallback to locations
              selectedSubcategories={selectedSubcategories}
              selectedConditions={selectedConditions}
              loading={loading}
              searchQuery={searchQuery}
              onSearchChange={(query) => onSearchChange?.(query)}
              onReset={handleReset}
              onSubcategoryChange={handleSubcategoryChange}
              onSubcategoriesChange={onSubcategoriesChange}
              onConditionChange={handleConditionChange}
            />
          )}
          {currentView === "list" && (
            <ListView
              locations={locations}
              loading={loading}
              onLocationClick={onLocationClick}
            />
          )}
          {currentView === "statistics" && (
            <StatisticsView locations={locations} categories={categories} />
          )}
          {currentView === "admin" && <AdminSection />}
          {currentView === "settings" && (
            <SettingsView
              currentStyle={currentStyle}
              onStyleChange={(style) => onStyleChange?.(style)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ControlPanel;
