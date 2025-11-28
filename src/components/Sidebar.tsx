"use client";

import {
  Map as MapIcon,
  Menu,
  User,
  Layers,
  Settings,
  List,
  ChartColumnBig,
  LayoutDashboard,
  Folder,
  MapPin,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { ViewType } from "@/constants";

interface SidebarProps {
  currentView?: ViewType;
  onViewChange?: (view: ViewType) => void;
  onPanelOpen?: () => void;
  mode?: "map" | "admin";
}

// Map Navigation items
const MAP_NAV_ITEMS: { view: ViewType; icon: typeof Layers; title: string }[] = [
  { view: "layers", icon: Layers, title: "Layer & Filter" },
  { view: "list", icon: List, title: "Daftar Lokasi" },
  { view: "statistics", icon: ChartColumnBig, title: "Statistik" },
  { view: "admin", icon: User, title: "Admin" },
];

// Admin Navigation items
const ADMIN_NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, title: "Dashboard" },
  { href: "/admin/locations/create", icon: MapPin, title: "Lokasi" },
  { href: "/admin/categories", icon: Folder, title: "Kategori" },
];

const Sidebar = ({
  currentView = "layers",
  onViewChange,
  onPanelOpen,
  mode = "map",
}: SidebarProps) => {
  const pathname = usePathname();

  const handleClick = useCallback(
    (view: ViewType) => {
      onViewChange?.(view);
      // Always request panel open when any icon is clicked
      onPanelOpen?.();
    },
    [onViewChange, onPanelOpen]
  );

  return (
    <div className="fixed left-0 top-0 h-screen w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-50 shadow-sm">
      {/* Logo */}
      <Link
        href="/"
        className="mb-8 p-2 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
        title="Kembali ke Peta"
      >
        <MapIcon className="text-white w-6 h-6" />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-6 w-full items-center">
        {mode === "map" ? (
          // Map Mode Navigation
          MAP_NAV_ITEMS.map(({ view, icon: Icon, title }) => (
            <button
              key={view}
              onClick={() => handleClick(view)}
              className={`p-3 rounded-xl transition-colors cursor-pointer ${currentView === view
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              title={title}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))
        ) : (
          // Admin Mode Navigation
          ADMIN_NAV_ITEMS.map(({ href, icon: Icon, title }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`p-3 rounded-xl transition-colors cursor-pointer ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  }`}
                title={title}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-6 w-full items-center">
        {mode === "map" ? (
          <>
            {/* Settings */}
            <button
              onClick={() => handleClick("settings")}
              className={`p-3 rounded-xl transition-colors cursor-pointer ${currentView === "settings"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              title="Pengaturan"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Menu Button */}
            <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
          </>
        ) : (
          <Link
            href="/"
            className="p-3 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            title="Keluar dari Admin"
          >
            <LogOut className="w-5 h-5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
