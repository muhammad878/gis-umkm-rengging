"use client";

import { Home, Map as MapIcon, Database, Settings, Menu, Shield } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
    return (
        <div className="h-screen w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-50 shadow-sm">
            <div className="mb-8 p-2 bg-blue-600 rounded-lg">
                <MapIcon className="text-white w-6 h-6" />
            </div>

            <nav className="flex-1 flex flex-col gap-6 w-full items-center">
                <Link href="/" className="p-3 rounded-xl bg-blue-50 text-blue-600 transition-colors cursor-pointer">
                    <Home className="w-5 h-5" />
                </Link>
                <Link href="/admin" className="p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer" title="Admin Dashboard">
                    <Shield className="w-5 h-5" />
                </Link>
                <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer">
                    <Database className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer">
                    <Settings className="w-5 h-5" />
                </button>
            </nav>

            <div className="mt-auto">
                <button className="p-3 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors cursor-pointer">
                    <Menu className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
