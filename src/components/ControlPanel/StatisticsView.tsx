import { Location, Category } from "@/types";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CATEGORY_COLORS } from "@/constants";

interface StatisticsViewProps {
    locations: Location[];
    categories: Category[];
}

export const StatisticsView = ({ locations, categories }: StatisticsViewProps) => {
    // Calculate stats
    const stats = useMemo(() => {
        const totalLocations = locations.length;

        // Count by category
        const categoryCounts = categories.map((cat, index) => {
            const count = locations.filter(l => l.category_id === cat.id).length;
            return {
                name: cat.name,
                count,
                color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
            };
        }).sort((a, b) => b.count - a.count);

        // Count by condition
        const conditionCounts = {
            baik: locations.filter(l => l.condition === "Baik").length,
            rusakRingan: locations.filter(l => l.condition === "Rusak Ringan").length,
            rusakBerat: locations.filter(l => l.condition === "Rusak Berat").length,
        };

        return {
            totalLocations,
            categoryCounts,
            conditionCounts
        };
    }, [locations, categories]);

    return (
        <div className="space-y-6 pb-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">Total Lokasi</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalLocations}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <p className="text-xs text-green-600 font-medium">Kategori</p>
                    <p className="text-2xl font-bold text-green-900">{categories.length}</p>
                </div>
            </div>

            {/* Category Chart */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Distribusi Kategori</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.categoryCounts} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={80}
                                tick={{ fontSize: 10 }}
                                interval={0}
                            />
                            <Tooltip
                                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                                {stats.categoryCounts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Condition Stats */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Kondisi Infrastruktur</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600">Baik</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{stats.conditionCounts.baik}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-gray-600">Rusak Ringan</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{stats.conditionCounts.rusakRingan}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-600">Rusak Berat</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{stats.conditionCounts.rusakBerat}</span>
                    </div>
                </div>
            </div>

            {/* Village Info */}
            <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Tentang Desa</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Desa Rengging merupakan salah satu desa di Kecamatan Pecangaan, Kabupaten Jepara.
                    Sistem Informasi Geografis ini memetakan infrastruktur dan fasilitas publik yang ada di desa
                    untuk memudahkan pemantauan dan perencanaan pembangunan.
                </p>
            </div>
        </div>
    );
};
