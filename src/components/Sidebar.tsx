"use client";

import { Home, Map as MapIcon, Database, Settings, Menu, Shield } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
    return (
        <div className="h-screen w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-50 shadow-sm">
            <Link href="/" className="mb-8 p-2 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <MapIcon className="text-white w-6 h-6" />
            </Link>

            <nav className="flex-1 flex flex-col gap-6 w-full items-center">
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
