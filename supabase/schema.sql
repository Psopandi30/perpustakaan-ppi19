-- ============================================
-- SUPABASE SETUP: PostgreSQL + RLS + Storage
-- Perpustakaan Digital PPI 19 Garut
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. AUTHENTICATION (Supabase Auth)
-- ============================================
-- Supabase Auth sudah built-in, kita hanya perlu:
-- 1. Enable email auth di Supabase Dashboard
-- 2. Setup custom user metadata jika diperlukan

-- Function untuk sync auth.users dengan public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, nama_lengkap, email, akun_status)
  VALUES (
    NEW.id::text::bigint,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', 'User'),
    NEW.email,
    'Tidak aktif'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-create user di public.users saat signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. DATABASE TABLES
-- ============================================

-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  nama_lengkap VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Santri',
  alamat TEXT,
  telepon VARCHAR(20),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100),
  password TEXT, -- Untuk backward compatibility (akan dihapus setelah migration)
  akun_status VARCHAR(20) NOT NULL DEFAULT 'Tidak aktif' CHECK (akun_status IN ('Aktif', 'Tidak aktif')),
  photo TEXT,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link ke Supabase Auth
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: settings
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  library_name VARCHAR(200) NOT NULL DEFAULT 'PERPUSTAKAAN DIGITAL PPI 19 GARUT',
  admin_password TEXT NOT NULL DEFAULT 'ppi19adm',
  login_logo TEXT,
  admin_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT settings_single_row CHECK (id = 1)
);

-- Table: bulletins
CREATE TABLE IF NOT EXISTS public.bulletins (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  cover_link TEXT,
  draf_link TEXT NOT NULL,
  nama_penulis VARCHAR(100) NOT NULL,
  tanggal_terbit DATE NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: written_works (Karya Tulis Santri)
CREATE TABLE IF NOT EXISTS public.written_works (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  nama_penulis VARCHAR(100) NOT NULL,
  tanggal_terbit DATE NOT NULL,
  cover_link TEXT,
  draf_link TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: general_books (Buku Umum/Skripsi)
CREATE TABLE IF NOT EXISTS public.general_books (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  nama_penulis VARCHAR(100) NOT NULL,
  tanggal_terbit DATE NOT NULL,
  cover_link TEXT,
  draf_link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: karya_asatidz
CREATE TABLE IF NOT EXISTS public.karya_asatidz (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  nama_penulis VARCHAR(100) NOT NULL,
  tanggal_terbit DATE NOT NULL,
  cover_link TEXT,
  draf_link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: materi_dakwah
CREATE TABLE IF NOT EXISTS public.materi_dakwah (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  nama_penulis VARCHAR(100) NOT NULL,
  tanggal_terbit DATE NOT NULL,
  cover_link TEXT,
  draf_link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: khutbah_jumat
CREATE TABLE IF NOT EXISTS public.khutbah_jumat (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  nama_penulis VARCHAR(100) NOT NULL,
  tanggal_terbit DATE NOT NULL,
  cover_link TEXT,
  draf_link TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: information
CREATE TABLE IF NOT EXISTS public.information (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  tanggal DATE NOT NULL,
  isi TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: radio_stream_data
CREATE TABLE IF NOT EXISTS public.radio_stream_data (
  id INTEGER PRIMARY KEY DEFAULT 1,
  title VARCHAR(200) NOT NULL DEFAULT 'Radio Stream',
  youtube_link TEXT,
  whatsapp_link TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT radio_stream_single_row CHECK (id = 1)
);

-- Table: chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  sender VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_radio_message BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('live-streaming', 'buletin', 'karya-tulis', 'buku-umum', 'karya-asatidz', 'materi-dakwah', 'khutbah-jumat', 'informasi')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: banners
CREATE TABLE IF NOT EXISTS public.banners (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  urutan INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: articles
CREATE TABLE IF NOT EXISTS public.articles (
  id BIGSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  konten TEXT,
  tanggal_terbit DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES (Untuk Performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_radio ON public.chat_messages(is_radio_message, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active, urutan);
CREATE INDEX IF NOT EXISTS idx_articles_date ON public.articles(tanggal_terbit DESC);

-- ============================================
-- 4. TRIGGERS (Auto-update updated_at)
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bulletins_updated_at BEFORE UPDATE ON public.bulletins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_written_works_updated_at BEFORE UPDATE ON public.written_works FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_general_books_updated_at BEFORE UPDATE ON public.general_books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_karya_asatidz_updated_at BEFORE UPDATE ON public.karya_asatidz FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materi_dakwah_updated_at BEFORE UPDATE ON public.materi_dakwah FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_khutbah_jumat_updated_at BEFORE UPDATE ON public.khutbah_jumat FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_information_updated_at BEFORE UPDATE ON public.information FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_radio_stream_data_updated_at BEFORE UPDATE ON public.radio_stream_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.written_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karya_asatidz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materi_dakwah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khutbah_jumat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_stream_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: Users
-- ============================================

-- Anyone can read active users (for login)
CREATE POLICY "Users can read active users" ON public.users
  FOR SELECT USING (akun_status = 'Aktif');

-- Only authenticated users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid()::text = auth_user_id::text OR auth.uid()::text = id::text);

-- Only service role can insert/update/delete (via API)
-- For now, allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = auth_user_id::text);

-- ============================================
-- RLS POLICIES: Settings
-- ============================================

-- Everyone can read settings (public info)
CREATE POLICY "Settings are readable by all" ON public.settings
  FOR SELECT USING (true);

-- Only authenticated admin can update (check via service role or custom logic)
-- For now, allow authenticated users (will be restricted in app logic)
CREATE POLICY "Authenticated users can update settings" ON public.settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES: Content Tables (Public Read)
-- ============================================

-- Bulletins: Public read, authenticated write
CREATE POLICY "Bulletins are readable by all" ON public.bulletins
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage bulletins" ON public.bulletins
  FOR ALL USING (auth.role() = 'authenticated');

-- Written Works: Public read, authenticated write
CREATE POLICY "Written works are readable by all" ON public.written_works
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage written works" ON public.written_works
  FOR ALL USING (auth.role() = 'authenticated');

-- General Books: Public read, authenticated write
CREATE POLICY "General books are readable by all" ON public.general_books
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage general books" ON public.general_books
  FOR ALL USING (auth.role() = 'authenticated');

-- Karya Asatidz: Public read, authenticated write
CREATE POLICY "Karya asatidz are readable by all" ON public.karya_asatidz
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage karya asatidz" ON public.karya_asatidz
  FOR ALL USING (auth.role() = 'authenticated');

-- Materi Dakwah: Public read, authenticated write
CREATE POLICY "Materi dakwah are readable by all" ON public.materi_dakwah
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage materi dakwah" ON public.materi_dakwah
  FOR ALL USING (auth.role() = 'authenticated');

-- Khutbah Jumat: Public read, authenticated write
CREATE POLICY "Khutbah jumat are readable by all" ON public.khutbah_jumat
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage khutbah jumat" ON public.khutbah_jumat
  FOR ALL USING (auth.role() = 'authenticated');

-- Information: Public read, authenticated write
CREATE POLICY "Information is readable by all" ON public.information
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage information" ON public.information
  FOR ALL USING (auth.role() = 'authenticated');

-- Radio Stream: Public read, authenticated write
CREATE POLICY "Radio stream is readable by all" ON public.radio_stream_data
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage radio stream" ON public.radio_stream_data
  FOR ALL USING (auth.role() = 'authenticated');

-- Chat Messages: Authenticated read/write
CREATE POLICY "Users can read chat messages" ON public.chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can send chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Notifications: Authenticated read, system write
CREATE POLICY "Users can read notifications" ON public.notifications
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Banners: Public read, authenticated write
CREATE POLICY "Banners are readable by all" ON public.banners
  FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage banners" ON public.banners
  FOR ALL USING (auth.role() = 'authenticated');

-- Articles: Public read, authenticated write
CREATE POLICY "Articles are readable by all" ON public.articles
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage articles" ON public.articles
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 6. INITIAL DATA
-- ============================================

-- Insert default settings
INSERT INTO public.settings (id, library_name, admin_password, login_logo, admin_photo)
VALUES (1, 'PERPUSTAKAAN DIGITAL PPI 19 GARUT', 'ppi19adm', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert default radio stream data
INSERT INTO public.radio_stream_data (id, title, youtube_link, whatsapp_link, is_published)
VALUES (1, 'Radio Stream', '', '', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. STORAGE BUCKETS (Akan dibuat via Supabase Dashboard)
-- ============================================
-- Storage buckets akan dibuat via Supabase Dashboard atau API
-- Lihat dokumentasi di SUPABASE_SETUP.md

-- ============================================
-- END OF SCHEMA
-- ============================================
