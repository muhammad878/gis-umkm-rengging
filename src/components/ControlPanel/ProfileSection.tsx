"use client";

import { User, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export const ProfileSection = () => {
    const router = useRouter();

    const handleLoginClick = () => {
        router.push("/login");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Login
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Login untuk mengakses fitur admin dan mengelola data lokasi
                </p>
                <button
                    onClick={handleLoginClick}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <LogIn className="w-4 h-4" />
                    Login
                </button>
            </div>

            <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Fitur Admin
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Tambah, edit, dan hapus lokasi</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Kelola kategori dan subkategori</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Upload foto lokasi</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Verifikasi laporan warga</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
