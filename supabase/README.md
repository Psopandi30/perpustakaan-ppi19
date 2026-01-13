# Supabase Setup Files

Folder ini berisi file-file untuk setup Supabase.

## 📁 File di Folder Ini

### 1. `schema.sql`
File SQL lengkap untuk setup database:
- ✅ Semua tabel yang diperlukan
- ✅ Indexes untuk performance
- ✅ Triggers untuk auto-update `updated_at`
- ✅ Row Level Security (RLS) policies
- ✅ Initial data (settings, radio_stream_data)

**Cara menggunakan:**
1. Buka Supabase Dashboard > SQL Editor
2. Copy semua isi file `schema.sql`
3. Paste dan klik Run

### 2. `storage-policies.sql`
File SQL untuk setup Storage policies:
- ✅ Policies untuk bucket `uploads`
- ✅ Policies untuk bucket `covers`
- ✅ Policies untuk bucket `documents`
- ✅ Policies untuk bucket `avatars`

**Cara menggunakan:**
1. Buat buckets terlebih dahulu di Supabase Dashboard > Storage
2. Buka SQL Editor
3. Copy semua isi file `storage-policies.sql`
4. Paste dan klik Run

### 3. `README.md` (file ini)
Dokumentasi setup files.

---

## 🚀 Quick Start

### Step 1: Jalankan Database Schema
```sql
-- Copy isi file schema.sql ke SQL Editor
-- Klik Run
```

### Step 2: Buat Storage Buckets
1. Buka Supabase Dashboard > Storage
2. Buat buckets:
   - `uploads` (public, 10MB limit)
   - `covers` (public, 5MB limit)
   - `documents` (public, 50MB limit)
   - `avatars` (public, 2MB limit)

### Step 3: Jalankan Storage Policies
```sql
-- Copy isi file storage-policies.sql ke SQL Editor
-- Klik Run
```

### Step 4: Setup Environment Variables
Buat file `.env` di root project:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 📚 Dokumentasi Lengkap

Lihat file `SUPABASE_SETUP.md` di root project untuk dokumentasi lengkap.

---

## ⚠️ Catatan Penting

1. **Jangan commit file `.env` ke Git!**
2. **Simpan database password dengan aman!**
3. **Jangan expose service_role key di frontend!**
4. **Test RLS policies setelah setup!**

---

## 🆘 Troubleshooting

Jika ada error saat menjalankan SQL:
1. Pastikan semua extension sudah di-enable
2. Pastikan tidak ada tabel yang sudah ada sebelumnya
3. Cek error message di SQL Editor
4. Pastikan RLS policies tidak conflict
