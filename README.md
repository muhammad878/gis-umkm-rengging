# 🗺️ SIG Desa Rengging (v1.0)

**Sistem Informasi Geografis (SIG) Desa Rengging, Pecangaan, Jepara.**  
Sebuah platform pemetaan digital interaktif berbasis web untuk memvisualisasikan infrastruktur, fasilitas publik, dan sebaran UMKM di wilayah Desa Rengging dengan tampilan modern dan premium.

---

## ✨ Fitur Utama

- **📍 Pemetaan Interaktif**: Visualisasi batas wilayah desa, jaringan jalan, aliran sungai, dan area persawahan secara detail.
- **🏬 Katalog Lokasi & Fasilitas**: Informasi lengkap mengenai fasilitas pemerintah, pendidikan, kesehatan, dan tempat ibadah.
- **🛍️ Ekosistem UMKM**: Fitur khusus untuk memetakan lokasi unit usaha mikro, kecil, dan menengah dengan navigasi langsung ke WhatsApp.
- **🔐 Sistem Autentikasi**: Fitur Login & Registrasi terintegrasi dengan **Supabase Auth** untuk keamanan data.
- **📊 Statistik Desa**: Ringkasan data jumlah fasilitas dan sebaran infrastruktur wilayah.
- **📱 Responsive & Premium UI**: Sidebar futuristik dan antarmuka yang dioptimalkan untuk berbagai layar.

---

## 🚀 Teknologi yang Digunakan

- **Frontend**: [Next.js 15+](https://nextjs.org/) (React), [Tailwind CSS](https://tailwindcss.com/)
- **Peta Digital**: [React Leaflet](https://react-leaflet.js.org/) & [OpenStreetMap](https://www.openstreetmap.org/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL & PostGIS)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Spasial**: GeoJSON & Shapefile (SHP) processing

---

## 🛠️ Panduan Instalasi

### 1. Kloning Repositori
```bash
git clone [url-repositori-anda]
cd gis
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di direktori utama dan isi dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPTILER_API_KEY=your-maptiler-key
```

### 4. Setup Database (Supabase)
Jalankan script SQL yang tersedia di folder root ke dalam SQL Editor Supabase secara berurutan:
1. `supabase_setup.sql` (Infrastruktur & Lokasi)
2. `supabase_umkm.sql` (Sistem UMKM)

### 5. Menjalankan Aplikasi
```bash
npm run dev
```
Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktur Folder
- `/src/app`: Logika navigasi dan halaman utama (App Router).
- `/src/components`: Komponen UI (Peta, Sidebar, Control Panel, Modals).
- `/src/hooks`: Logika custom React Hooks (Auth, Database).
- `/src/lib`: Konfigurasi library eksternal (Supabase Client).
- `/public/data`: Data GeoJSON wilayah Desa Rengging.

---

## 📝 Kontribusi
Platform ini dikembangkan untuk memudahkan masyarakat dan perangkat desa dalam memantau perencanaan pembangunan serta mempromosikan UMKM lokal Desa Rengging.

**SIG Desa Rengging - Menuju Digitalisasi Desa.**
