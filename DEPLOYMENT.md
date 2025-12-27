# GIS UMKM Desa Rengging - Deployment Guide

## Cloudflare Pages Deployment

### Masalah yang Terjadi
Error `Output directory "out" not found` terjadi karena aplikasi Next.js ini menggunakan fitur server-side (dynamic routes, API routes) yang tidak kompatibel dengan static export biasa.

### Solusi: Gunakan Vercel (Recommended)

Karena aplikasi ini menggunakan:
- Dynamic routes (`/admin/categories/[id]`)
- Supabase Auth (server-side)
- Real-time database features

**Vercel adalah platform terbaik** untuk deployment Next.js dengan fitur-fitur ini.

#### Langkah Deploy ke Vercel:

1. **Push ke GitHub** (sudah dilakukan)
   
2. **Import ke Vercel:**
   - Buka [vercel.com](https://vercel.com)
   - Klik "Add New Project"
   - Import repository GitHub Anda
   
3. **Configure Environment Variables:**
   Di Vercel dashboard, tambahkan environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_key
   ```

4. **Deploy:**
   - Klik "Deploy"
   - Vercel akan otomatis build dan deploy

### Alternatif: Cloudflare Pages dengan @cloudflare/next-on-pages

Jika tetap ingin menggunakan Cloudflare Pages:

1. **Update Build Settings di Cloudflare Pages Dashboard:**
   - Build command: `npx @cloudflare/next-on-pages@1`
   - Build output directory: `.vercel/output/static`
   - Node version: `22`

2. **Add Environment Variables** di Cloudflare Pages:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MAPTILER_API_KEY`
   - `NODE_VERSION=22`

3. **Retry Deployment**

### Rekomendasi
Gunakan **Vercel** untuk deployment yang lebih mudah dan stabil dengan Next.js.
