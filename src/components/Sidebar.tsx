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
    ClipboardList,
    Plus,
    LogOut,
    LogIn,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { ViewType } from "@/constants";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
    currentView?: ViewType;
    onViewChange?: (view: ViewType) => void;
    onPanelOpen?: () => void;
    isPanelOpen?: boolean;
    onPanelToggle?: (isOpen: boolean) => void;
    mode?: "map" | "admin";
}

// Map Navigation items
const MAP_NAV_ITEMS: { view: ViewType; icon: typeof Layers; title: string }[] =
    [
        { view: "layers", icon: Layers, title: "Layer & Filter" },
        { view: "list", icon: List, title: "Daftar Lokasi" },
        { view: "statistics", icon: ChartColumnBig, title: "Statistik" },
        { view: "settings", icon: Settings, title: "Pengaturan Peta" },
    ];

// Admin Navigation items
const ADMIN_NAV_ITEMS = [
    { href: "/admin", icon: LayoutDashboard, title: "Dashboard" },
    { href: "/admin/locations/create", icon: Plus, title: "Tambah Lokasi" },
    { href: "/admin/reports", icon: ClipboardList, title: "Laporan" },
];

const Sidebar = ({
    currentView = "layers",
    onViewChange,
    onPanelOpen,
    isPanelOpen,
    onPanelToggle,
    mode = "map",
}: SidebarProps) => {
    const pathname = usePathname();
    const { user, signInWithGoogle, signOut, loading } = useAuth();

    const handleClick = useCallback(
        (view: ViewType) => {
            if (mode === "map") {
                if (view === currentView && isPanelOpen) {
                    onPanelToggle?.(false);
                } else {
                    onViewChange?.(view);
                    onPanelToggle?.(true);
                }
            } else {
                onViewChange?.(view);
                onPanelOpen?.();
            }
        },
        [currentView, isPanelOpen, mode, onViewChange, onPanelToggle, onPanelOpen]
    );

    return (
        <div className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 flex flex-row items-center justify-around z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:top-0 md:h-screen md:w-16 md:flex-col md:justify-start md:border-t-0 md:border-r md:py-4 md:shadow-sm transition-all duration-300">
            {/* Logo - Hidden on Mobile */}
            <Link
                href="/"
                className="hidden md:flex mb-8 p-2 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                title="Kembali ke Peta"
            >
                <MapIcon className="text-white w-6 h-6" />
            </Link>

            {/* Auth Section - Desktop Only */}
            <div className="hidden md:flex flex-col items-center mb-6">
                {loading ? (
                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                ) : user ? (
                    <div className="flex flex-col items-center gap-3">
                        {user.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="User Avatar"
                                className="w-9 h-9 rounded-xl border-2 border-blue-100 shadow-sm"
                                title={user.user_metadata.full_name || user.email || "User"}
                            />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-100"
                                title={user.email || "User"}
                            >
                                {(user.email || "U").substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <button
                            onClick={signOut}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                            title="Keluar"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-blue-200 hover:-translate-y-0.5"
                        title="Masuk ke Akun"
                    >
                        <LogIn className="w-5 h-5" />
                    </Link>
                )}
                <div className="w-8 h-px bg-gray-100 mt-6" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-row justify-evenly w-full items-center md:flex-col md:justify-start md:gap-6">
                {mode === "map"
                    ? // Map Mode Navigation
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
                            <Icon className="w-6 h-6 md:w-5 md:h-5" />
                        </button>
                    ))
                    : // Admin Mode Navigation
                    ADMIN_NAV_ITEMS.map(({ href, icon: Icon, title }) => {
                        const isActive =
                            pathname === href ||
                            (href !== "/admin" && pathname.startsWith(href));
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
                                <Icon className="w-6 h-6 md:w-5 md:h-5" />
                            </Link>
                        );
                    })}

                {/* Mobile Only: Simple Profile/Login Icon if needed in nav bar */}
                <div className="md:hidden">
                    {user ? (
                        <button onClick={signOut} className="p-3 rounded-xl text-gray-400 hover:text-red-500">
                            <LogOut className="w-6 h-6" />
                        </button>
                    ) : (
                        <Link href="/login" className="p-3 block rounded-xl text-gray-400">
                            <LogIn className="w-6 h-6" />
                        </Link>
                    )}
                </div>
            </nav>

            {/* Bottom Actions - Hidden on Mobile as Settings is in nav */}
            <div className="hidden md:flex mt-auto flex-col gap-4 w-full items-center pb-4">
                {mode === "map" && (
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
                )}
            </div>
        </div>
    );
};

export default Sidebar;
