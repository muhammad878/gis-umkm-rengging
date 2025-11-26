"use client";

import { Search, Filter, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Category {
    id: string;
    name: string;
    subcategories: Subcategory[];
}

interface Subcategory {
    id: string;
    name: string;
}

const ControlPanel = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('categories')
                    .select('*, subcategories(*)');

                if (categoriesError) throw categoriesError;

                if (categoriesData) {
                    setCategories(categoriesData);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <>
            {/* Toggle Button - Outside the panel */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed ml-2 top-4 p-2.5 bg-blue-600 text-white border-2 border-blue-700 rounded-lg shadow-lg hover:bg-blue-700 transition-all z-[1000] cursor-pointer"
                style={{
                    minWidth: '36px',
                    minHeight: '36px',
                    left: isOpen ? '320px' : '64px',
                    transition: 'left 0.3s ease-in-out'
                }}
            >
                {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className={`${isOpen ? 'w-64' : 'w-0'} h-screen bg-white border-r border-gray-200 flex flex-col z-40 shadow-lg transition-all duration-300 overflow-hidden`}>
                <div className="p-4 border-b border-gray-100">
                    <h1 className="text-base font-bold text-gray-900 whitespace-nowrap">SIG Jambu Timur</h1>
                    <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">Infrastruktur & Fasilitas</p>
                </div>

                <div className="p-3 overflow-y-auto flex-1">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari lokasi..."
                            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Layers */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" />
                                Layer Pemetaan
                            </h2>
                            <button className="text-[10px] text-blue-600 font-medium hover:text-blue-700 cursor-pointer">Reset</button>
                        </div>

                        {loading ? (
                            <div className="text-xs text-gray-500">Memuat kategori...</div>
                        ) : (
                            <div className="space-y-4">
                                {categories.map((category) => (
                                    <div key={category.id}>
                                        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{category.name}</h3>
                                        <div className="space-y-1.5">
                                            {category.subcategories?.map((sub) => (
                                                <label key={sub.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer group">
                                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" defaultChecked />
                                                    <span className="text-xs text-gray-700 group-hover:text-gray-900">{sub.name}</span>
                                                </label>
                                            ))}
                                            {(!category.subcategories || category.subcategories.length === 0) && (
                                                <label className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer group">
                                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" defaultChecked />
                                                    <span className="text-xs text-gray-700 group-hover:text-gray-900">Semua {category.name}</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div className="text-xs text-gray-500 italic">Belum ada kategori data.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5" />
                                Filter Kondisi
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {["Baik", "Rusak Ringan", "Rusak Berat"].map((status) => (
                                <button key={status} className="px-2.5 py-1 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <button className="w-full py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
                        Terapkan Filter
                    </button>
                </div>
            </div>
        </>
    );
};

export default ControlPanel;
