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
import { ListView } from "./ControlPanel/ListView";
import { StatisticsView } from "./ControlPanel/StatisticsView";

// Panel header configuration
const PANEL_HEADERS: Record<ViewType, { title: string; subtitle: string }> = {
    layers: { title: "Desa Rengging", subtitle: "" },
    list: { title: "Daftar Lokasi", subtitle: "Detail Infrastruktur" },
    statistics: { title: "Statistik Desa", subtitle: "Data & Informasi" },
    settings: { title: "Pengaturan Peta", subtitle: "Tampilan & Gaya" },
};

interface ControlPanelProps {
    categories: Category[];
    locations: Location[];
    allLocations?: Location[]; // Added allLocations prop
    selectedSubcategories: string[];
    onSubcategoriesChange: (subcategories: string[]) => void;
    loading: boolean;
    currentView?: ViewType;
    currentStyle?: string;
    onStyleChange?: (style: string) => void;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    onLocationClick?: (location: Location) => void;
    visibleLayers: string[];
    onVisibleLayersChange: (layers: string[]) => void;
}

const ControlPanel = ({
    categories,
    locations,
    allLocations,
    selectedSubcategories,
    onSubcategoriesChange,
    loading,
    currentView = "layers",
    currentStyle = "streets",
    onStyleChange,
    isOpen,
    onOpenChange,
    searchQuery = "",
    onSearchChange,
    onLocationClick,
    visibleLayers,
    onVisibleLayersChange,
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

    const handleReset = useCallback(() => {
        onSubcategoriesChange([]);
        onSearchChange?.("");
    }, [onSubcategoriesChange, onSearchChange]);

    // Calculate toggle button position
    const toggleButtonLeft = useMemo(
        () => (isOpen ? SIDEBAR_WIDTH + PANEL_WIDTH : SIDEBAR_WIDTH),
        [isOpen]
    );

    const header = PANEL_HEADERS[currentView];

    return (
        <>
            {/* Toggle Button - Desktop Only */}
            <button
                onClick={handleToggle}
                className="hidden md:flex fixed top-4 p-2.5 bg-blue-600 text-white border-2 border-blue-700 rounded-lg shadow-lg hover:bg-blue-700 transition-all z-[1000] cursor-pointer"
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
                className={`fixed bg-white z-40 transition-all duration-300 shadow-xl overflow-hidden
                    md:top-0 md:h-screen md:border-r md:border-gray-200 md:left-16
                    ${isOpen ? "md:w-64 w-full translate-y-0" : "md:w-0 w-full translate-y-full"}
                    bottom-16 left-0 h-[65vh] rounded-t-3xl border-t border-gray-200 md:rounded-none md:translate-y-0
                `}
            >
                {/* Mobile Drag Handle */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => onOpenChange(false)}>
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer" />
                </div>

                {/* Header */}
                <div className="px-5 pb-4 pt-2 md:pt-5 md:pb-5 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50 flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none tracking-tight">
                            {header.title.split(' ').map((word, i) => (
                                <span key={i} className="block uppercase">{word}</span>
                            ))}
                        </h1>
                        {header.subtitle && (
                            <p className="text-[10px] text-blue-600 mt-2 font-bold uppercase tracking-[0.2em]">
                                {header.subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-3 overflow-y-auto h-[calc(65vh-8rem)] md:h-auto md:flex-1">
                    {currentView === "layers" && (
                        <LayersView
                            categories={categories}
                            locations={allLocations || locations}
                            selectedSubcategories={selectedSubcategories}
                            loading={loading}
                            searchQuery={searchQuery}
                            onSearchChange={(query) => onSearchChange?.(query)}
                            onReset={handleReset}
                            onSubcategoryChange={handleSubcategoryChange}
                            onSubcategoriesChange={onSubcategoriesChange}
                            onLocationClick={onLocationClick}
                            visibleLayers={visibleLayers}
                            onVisibleLayersChange={onVisibleLayersChange}
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
