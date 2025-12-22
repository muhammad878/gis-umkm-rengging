"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { LogIn, Mail, Lock, ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmail(formData.email, formData.password);
        router.push("/");
      } else {
        await signUpWithEmail(formData.email, formData.password);
        alert("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat autentikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
        >
          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:border-gray-200 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Kembali ke Peta
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 rotate-3">
                <LogIn className="w-8 h-8 text-white -rotate-3" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isLogin
                  ? "Masuk untuk mengelola data SIG Desa Rengging"
                  : "Daftar untuk berkontribusi memetakan desa"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    !
                  </div>
                  <span>{error}</span>
                </div>
                {error.includes("Email not confirmed") && (
                  <button
                    onClick={async () => {
                      const { error: resendError } = await supabase.auth.resend({
                        type: 'signup',
                        email: formData.email,
                      });
                      if (resendError) alert("Gagal mengirim ulang: " + resendError.message);
                      else alert("Email konfirmasi telah dikirim ulang! Cek inbox/spam Anda.");
                    }}
                    className="ml-8 text-xs font-bold underline hover:text-red-800 text-left"
                  >
                    Kirim ulang email konfirmasi
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="email"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="password"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isLogin ? (
                  <>
                    <LogIn className="w-5 h-5" />
                    Masuk Sekarang
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Daftar Akun
                  </>
                )}
              </button>
            </form>

          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isLogin
                ? "Belum punya akun? Daftar di sini"
                : "Sudah punya akun? Masuk di sini"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
