import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GIS Dashboard",
  description: "Spatial Data Visualization Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
        {/* Mobile Warning Overlay */}
        <div className="lg:hidden fixed inset-0 bg-gray-50 flex flex-col items-center justify-center p-6 text-center z-[9999]">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Tampilan Desktop Only
          </h1>
          <p className="text-gray-500 max-w-xs mx-auto">
            Mohon maaf, aplikasi ini belum mendukung tampilan mobile/tablet.
            Silakan buka melalui perangkat desktop atau laptop untuk pengalaman
            terbaik.
          </p>
        </div>

        {/* Main Content - Only visible on desktop */}
        <div className="hidden lg:block h-screen w-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
