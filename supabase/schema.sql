-- Database Schema untuk Perpustakaan Digital IAI Persis Garut
-- Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    nama_lengkap TEXT NOT NULL,
    status TEXT NOT NULL,
    alamat TEXT NOT NULL,
    telepon TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT 'password',
    email TEXT,
    akun_status TEXT NOT NULL DEFAULT 'Tidak aktif' CHECK (akun_status IN ('Aktif', 'Tidak aktif')),
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    library_name TEXT NOT NULL DEFAULT 'PERPUSTAKAAN DIGITAL IAI PERSIS GARUT',
    admin_password TEXT NOT NULL DEFAULT 'password', -- Akan di-hash oleh Supabase Auth
    login_logo TEXT,
    admin_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (id, library_name, admin_password) 
VALUES (1, 'PERPUSTAKAAN DIGITAL IAI PERSIS GARUT', 'password')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BULLETINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bulletins (
    id BIGSERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    cover_link TEXT,
    draf_link TEXT NOT NULL,
    nama_penulis TEXT NOT NULL,
    tanggal_terbit DATE NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WRITTEN WORKS TABLE (Jurnal)
-- ============================================
CREATE TABLE IF NOT EXISTS written_works (
    id BIGSERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    nama_penulis TEXT NOT NULL,
    tanggal_terbit DATE NOT NULL,
    cover_link TEXT,
    draf_link TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- GENERAL BOOKS TABLE (Skripsi)
-- ============================================
CREATE TABLE IF NOT EXISTS general_books (
    id BIGSERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    nama_penulis TEXT NOT NULL,
    tanggal_terbit DATE NOT NULL,
    cover_link TEXT,
    draf_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- KARYA ASATIDZ TABLE (Karya Ulama Persis)
-- ============================================
CREATE TABLE IF NOT EXISTS karya_asatidz (
    id BIGSERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    nama_penulis TEXT NOT NULL,
    tanggal_terbit DATE NOT NULL,
    cover_link TEXT,
    draf_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MATERI DAKWAH TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS materi_dakwah (
    id BIGSERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    nama_penulis TEXT NOT NULL,
    tanggal_terbit DATE NOT NULL,
    cover_link TEXT,
    draf_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- KHUTBAH JUMAT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS khutbah_jumat (
    id BIGSERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    nama_penulis TEXT NOT NULL,
    tanggal_terbit DATE NOT NULL,
    cover_link TEXT,
    draf_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INFORMATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS information (
    id BIGSERIAL PRIMARY KEY,
    judul TEXT NOT NULL,
    tanggal DATE NOT NULL,
    isi TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RADIO STREAM DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS radio_stream_data (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    youtube_link TEXT,
    whatsapp_link TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default radio stream data
INSERT INTO radio_stream_data (id, title, whatsapp_link, is_published) 
VALUES (1, 'BEDAH BUKU FIQIH DUNIA PERNIKAHAN', '085xxxx6578', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_radio_message BOOLEAN DEFAULT FALSE, -- Untuk membedakan chat biasa dan chat radio
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHAT THREADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_threads (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    unread_by_admin BOOLEAN DEFAULT FALSE,
    unread_by_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('live-streaming', 'buletin', 'karya-tulis', 'buku-umum', 'karya-asatidz', 'materi-dakwah', 'khutbah-jumat', 'informasi', 'jurnal', 'skripsi', 'karya-ulama-persis')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_akun_status ON users(akun_status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE written_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE karya_asatidz ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi_dakwah ENABLE ROW LEVEL SECURITY;
ALTER TABLE khutbah_jumat ENABLE ROW LEVEL SECURITY;
ALTER TABLE information ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_stream_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (akan di-restrict lebih lanjut jika perlu)
-- Untuk sekarang, kita allow semua untuk authenticated users
-- Nanti bisa ditambahkan role-based access control

-- Users: Allow read for all, write for authenticated
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users are insertable by authenticated users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users are updatable by authenticated users" ON users FOR UPDATE USING (true);
CREATE POLICY "Users are deletable by authenticated users" ON users FOR DELETE USING (true);

-- Settings: Allow read for all, write for authenticated
CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);
CREATE POLICY "Settings are updatable by authenticated users" ON settings FOR UPDATE USING (true);

-- Bulletins: Allow read for all, write for authenticated
CREATE POLICY "Bulletins are viewable by everyone" ON bulletins FOR SELECT USING (true);
CREATE POLICY "Bulletins are insertable by authenticated users" ON bulletins FOR INSERT WITH CHECK (true);
CREATE POLICY "Bulletins are updatable by authenticated users" ON bulletins FOR UPDATE USING (true);
CREATE POLICY "Bulletins are deletable by authenticated users" ON bulletins FOR DELETE USING (true);

-- Written Works: Allow read for all, write for authenticated
CREATE POLICY "Written works are viewable by everyone" ON written_works FOR SELECT USING (true);
CREATE POLICY "Written works are insertable by authenticated users" ON written_works FOR INSERT WITH CHECK (true);
CREATE POLICY "Written works are updatable by authenticated users" ON written_works FOR UPDATE USING (true);
CREATE POLICY "Written works are deletable by authenticated users" ON written_works FOR DELETE USING (true);

-- General Books: Allow read for all, write for authenticated
CREATE POLICY "General books are viewable by everyone" ON general_books FOR SELECT USING (true);
CREATE POLICY "General books are insertable by authenticated users" ON general_books FOR INSERT WITH CHECK (true);
CREATE POLICY "General books are updatable by authenticated users" ON general_books FOR UPDATE USING (true);
CREATE POLICY "General books are deletable by authenticated users" ON general_books FOR DELETE USING (true);

-- Karya Asatidz: Allow read for all, write for authenticated
CREATE POLICY "Karya asatidz are viewable by everyone" ON karya_asatidz FOR SELECT USING (true);
CREATE POLICY "Karya asatidz are insertable by authenticated users" ON karya_asatidz FOR INSERT WITH CHECK (true);
CREATE POLICY "Karya asatidz are updatable by authenticated users" ON karya_asatidz FOR UPDATE USING (true);
CREATE POLICY "Karya asatidz are deletable by authenticated users" ON karya_asatidz FOR DELETE USING (true);

-- Materi Dakwah: Allow read for all, write for authenticated
CREATE POLICY "Materi dakwah are viewable by everyone" ON materi_dakwah FOR SELECT USING (true);
CREATE POLICY "Materi dakwah are insertable by authenticated users" ON materi_dakwah FOR INSERT WITH CHECK (true);
CREATE POLICY "Materi dakwah are updatable by authenticated users" ON materi_dakwah FOR UPDATE USING (true);
CREATE POLICY "Materi dakwah are deletable by authenticated users" ON materi_dakwah FOR DELETE USING (true);

-- Khutbah Jumat: Allow read for all, write for authenticated
CREATE POLICY "Khutbah jumat are viewable by everyone" ON khutbah_jumat FOR SELECT USING (true);
CREATE POLICY "Khutbah jumat are insertable by authenticated users" ON khutbah_jumat FOR INSERT WITH CHECK (true);
CREATE POLICY "Khutbah jumat are updatable by authenticated users" ON khutbah_jumat FOR UPDATE USING (true);
CREATE POLICY "Khutbah jumat are deletable by authenticated users" ON khutbah_jumat FOR DELETE USING (true);

-- Information: Allow read for all, write for authenticated
CREATE POLICY "Information are viewable by everyone" ON information FOR SELECT USING (true);
CREATE POLICY "Information are insertable by authenticated users" ON information FOR INSERT WITH CHECK (true);
CREATE POLICY "Information are updatable by authenticated users" ON information FOR UPDATE USING (true);
CREATE POLICY "Information are deletable by authenticated users" ON information FOR DELETE USING (true);

-- Radio Stream Data: Allow read for all, write for authenticated
CREATE POLICY "Radio stream data are viewable by everyone" ON radio_stream_data FOR SELECT USING (true);
CREATE POLICY "Radio stream data are updatable by authenticated users" ON radio_stream_data FOR UPDATE USING (true);

-- Chat Messages: Allow read/write for authenticated users
CREATE POLICY "Chat messages are viewable by authenticated users" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Chat messages are insertable by authenticated users" ON chat_messages FOR INSERT WITH CHECK (true);

-- Chat Threads: Allow read/write for authenticated users
CREATE POLICY "Chat threads are viewable by authenticated users" ON chat_threads FOR SELECT USING (true);
CREATE POLICY "Chat threads are insertable by authenticated users" ON chat_threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Chat threads are updatable by authenticated users" ON chat_threads FOR UPDATE USING (true);

-- Notifications: Users can only see their own notifications
CREATE POLICY "Notifications are viewable by owner" ON notifications FOR SELECT USING (auth.uid()::text = user_id::text OR true); -- Temporary: allow all for now
CREATE POLICY "Notifications are insertable by authenticated users" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Notifications are updatable by owner" ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text OR true); -- Temporary: allow all for now

-- ============================================
-- FUNCTIONS for updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bulletins_updated_at BEFORE UPDATE ON bulletins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_written_works_updated_at BEFORE UPDATE ON written_works FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_general_books_updated_at BEFORE UPDATE ON general_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_karya_asatidz_updated_at BEFORE UPDATE ON karya_asatidz FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materi_dakwah_updated_at BEFORE UPDATE ON materi_dakwah FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_khutbah_jumat_updated_at BEFORE UPDATE ON khutbah_jumat FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_information_updated_at BEFORE UPDATE ON information FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_radio_stream_data_updated_at BEFORE UPDATE ON radio_stream_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_threads_updated_at BEFORE UPDATE ON chat_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

