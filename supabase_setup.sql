-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables
CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id uuid REFERENCES subcategories(id) ON DELETE SET NULL,
    latitude NUMERIC(10,6) NOT NULL,
    longitude NUMERIC(10,6) NOT NULL,
    geom GEOMETRY(POINT, 4326), -- Spatial column
    address TEXT,
    dusun TEXT,
    contact TEXT,
    condition TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS location_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS infrastructure_conditions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    checked_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_conditions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read location images" ON location_images FOR SELECT USING (true);
CREATE POLICY "Public read infrastructure conditions" ON infrastructure_conditions FOR SELECT USING (true);

-- Admin insert
CREATE POLICY "Admin insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin insert subcategories" ON subcategories FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin insert locations" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin insert location images" ON location_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin insert infra conditions" ON infrastructure_conditions FOR INSERT WITH CHECK (true);

-- Admin update
CREATE POLICY "Admin update locations" ON locations FOR UPDATE USING (true);

-- Admin delete
CREATE POLICY "Admin delete locations" ON locations FOR DELETE USING (true);
CREATE POLICY "Admin delete images" ON location_images FOR DELETE USING (true);
CREATE POLICY "Admin delete infra conditions" ON infrastructure_conditions FOR DELETE USING (true);

-- Triggers
-- Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Update geom from lat/long
CREATE OR REPLACE FUNCTION update_locations_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_locations_geom_trigger
BEFORE INSERT OR UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_locations_geom();

-- Create spatial index
CREATE INDEX IF NOT EXISTS locations_geom_idx ON locations USING GIST (geom);
