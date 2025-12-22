"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error during auth callback:", error.message);
            }
            router.push("/");
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="p-8 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <h2 className="text-lg font-bold text-gray-900">Menyelesaikan Autentikasi...</h2>
                <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar.</p>
            </div>
        </div>
    );
}
