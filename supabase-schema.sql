-- ============================================
-- Inventario del Claustro - Supabase Schema
-- ============================================

-- 1. Create the art_pieces table
CREATE TABLE art_pieces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  year_period VARCHAR(100),
  origin_place VARCHAR(255),
  civilization VARCHAR(255),
  artist VARCHAR(255),
  technique VARCHAR(255),
  material VARCHAR(255),
  dimensions VARCHAR(255),
  weight VARCHAR(100),
  condition VARCHAR(100),
  estimated_value_usd DECIMAL(12, 2),
  status VARCHAR(20) DEFAULT 'inventario' CHECK (status IN ('inventario', 'vendido', 'prestado')),
  loaned_to VARCHAR(255),
  loan_date DATE,
  loan_return_date DATE,
  sold_to VARCHAR(255),
  sale_date DATE,
  sale_price DECIMAL(12, 2),
  acquisition_date DATE,
  acquisition_source VARCHAR(255),
  location_in_warehouse VARCHAR(255),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_art_pieces_updated_at
  BEFORE UPDATE ON art_pieces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Enable Row Level Security
ALTER TABLE art_pieces ENABLE ROW LEVEL SECURITY;

-- 4. Allow all operations with anon key (single-user app)
CREATE POLICY "Allow read" ON art_pieces FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON art_pieces FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON art_pieces FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON art_pieces FOR DELETE USING (true);

-- 5. Create storage bucket for art photos
INSERT INTO storage.buckets (id, name, public) VALUES ('art-photos', 'art-photos', true);

-- 6. Storage policies for art-photos bucket
CREATE POLICY "Public read photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'art-photos');

CREATE POLICY "Allow upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'art-photos');

CREATE POLICY "Allow update photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'art-photos');

CREATE POLICY "Allow delete photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'art-photos');
