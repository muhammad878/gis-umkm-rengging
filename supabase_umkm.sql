-- Aktifkan ekstensi PostGIS untuk data geografis
CREATE EXTENSION IF NOT EXISTS postgis;

-- Buat tabel UMKM
CREATE TABLE IF NOT EXISTS public.umkm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_usaha TEXT NOT NULL,
    kategori TEXT NOT NULL,
    deskripsi TEXT,
    alamat TEXT,
    no_whatsapp TEXT,
    lokasi GEOMETRY(POINT, 4326), -- Format GIS (Long, Lat)
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    status_verifikasi BOOLEAN DEFAULT false,
    laporan_count INTEGER DEFAULT 0
);

-- Index spasial untuk pencarian lokasi yang cepat
CREATE INDEX IF NOT EXISTS umkm_lokasi_idx ON public.umkm USING GIST (lokasi);

-- Set Up Row Level Security (RLS)
ALTER TABLE public.umkm ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang (termasuk anonim) bisa melihat data UMKM
CREATE POLICY "Umum dapat melihat UMKM" ON public.umkm
    FOR SELECT USING (true);

-- Policy: Hanya user yang login yang bisa menambah data
CREATE POLICY "User terautentikasi dapat menambah UMKM" ON public.umkm
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Pemilik atau semua orang bisa update (sesuai permintaan user: 'siapa saja bisa update')
-- Karena user ingin 'siapa saja bisa update', kita izinkan user terautentikasi untuk update data apa pun.
-- Catatan: Secara ideal hanya pemilik, tapi ini mengikuti instruksi user.
CREATE POLICY "User terautentikasi dapat update UMKM" ON public.umkm
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Tambahkan fungsi helper untuk mempermudah input dari frontend (Long, Lat)
CREATE OR REPLACE FUNCTION public.create_umkm_with_coords(
    p_nama TEXT,
    p_kategori TEXT,
    p_deskripsi TEXT,
    p_alamat TEXT,
    p_wa TEXT,
    p_lat DOUBLE PRECISION,
    p_long DOUBLE PRECISION,
    p_foto TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.umkm (nama_usaha, kategori, deskripsi, alamat, no_whatsapp, lokasi, foto_url, created_by)
    VALUES (p_nama, p_kategori, p_deskripsi, p_alamat, p_wa, ST_SetSRID(ST_MakePoint(p_long, p_lat), 4326), p_foto, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
