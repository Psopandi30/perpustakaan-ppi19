# 🚀 Setup Supabase: Auth + PostgreSQL + RLS + Storage

Dokumentasi lengkap untuk setup Supabase dengan Authentication, PostgreSQL Database dengan Row Level Security (RLS), dan Storage.

---

## 📋 Daftar Isi

1. [Setup Supabase Project](#1-setup-supabase-project)
2. [Authentication Setup](#2-authentication-setup)
3. [Database Schema & RLS](#3-database-schema--rls)
4. [Storage Setup](#4-storage-setup)
5. [Environment Variables](#5-environment-variables)
6. [Testing](#6-testing)

---

## 1. Setup Supabase Project

### 1.1 Buat Akun Supabase
1. Kunjungi: https://supabase.com
2. Klik **"Start your project"**
3. Login dengan GitHub atau Google
4. Klik **"New Project"**

### 1.2 Buat Project Baru
- **Name**: `literasi-membaca-ppi19` (atau nama lain)
- **Database Password**: Buat password yang kuat (⚠️ **SIMPAN PASSWORD INI!**)
- **Region**: Pilih **Singapore** (terdekat dengan Indonesia)
- **Pricing Plan**: Pilih **Free** (cukup untuk development)

### 1.3 Tunggu Project Siap
- Proses setup memakan waktu 1-2 menit
- Tunggu sampai status project menjadi **"Active"**

---

## 2. Authentication Setup

### 2.1 Enable Email Authentication
1. Di Supabase Dashboard, klik **Authentication** di sidebar kiri
2. Klik **Providers**
3. Pastikan **Email** provider sudah enabled (default: enabled)
4. Konfigurasi (opsional):
   - **Enable email confirmations**: OFF (untuk development) atau ON (untuk production)
   - **Secure email change**: ON
   - **Double confirm email changes**: ON

### 2.2 Setup Email Templates (Opsional)
1. Klik **Email Templates** di menu Authentication
2. Customize email templates sesuai kebutuhan:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### 2.3 Setup Auth Settings
1. Klik **Settings** di menu Authentication
2. Konfigurasi:
   - **Site URL**: `http://localhost:3000` (development) atau domain production
   - **Redirect URLs**: Tambahkan URL yang diizinkan untuk redirect setelah auth

---

## 3. Database Schema & RLS

### 3.1 Jalankan SQL Schema
1. Di Supabase Dashboard, klik **SQL Editor** di sidebar kiri
2. Klik **New Query**
3. Buka file `supabase/schema.sql` di project Anda
4. Copy **SEMUA** isi file tersebut
5. Paste ke SQL Editor di Supabase
6. Klik **Run** (atau tekan `Ctrl+Enter` / `Cmd+Enter`)

### 3.2 Verifikasi Tables
1. Klik **Table Editor** di sidebar kiri
2. Anda harus melihat semua tabel:
   - ✅ `users`
   - ✅ `settings`
   - ✅ `bulletins`
   - ✅ `written_works`
   - ✅ `general_books`
   - ✅ `karya_asatidz`
   - ✅ `materi_dakwah`
   - ✅ `khutbah_jumat`
   - ✅ `information`
   - ✅ `radio_stream_data`
   - ✅ `chat_messages`
   - ✅ `notifications`
   - ✅ `banners`
   - ✅ `articles`

### 3.3 Verifikasi RLS Policies
1. Klik **Authentication** > **Policies** (atau Table Editor > pilih table > tab Policies)
2. Pastikan setiap tabel memiliki policies yang sesuai
3. RLS sudah di-enable untuk semua tabel

### 3.4 Test RLS (Opsional)
1. Buka **SQL Editor**
2. Jalankan query test:
```sql
-- Test sebagai anonymous user (harus bisa read public content)
SET ROLE anon;
SELECT * FROM bulletins LIMIT 1;

-- Test sebagai authenticated user (harus bisa read semua)
SET ROLE authenticated;
SELECT * FROM bulletins LIMIT 1;

-- Reset role
RESET ROLE;
```

---

## 4. Storage Setup

### 4.1 Buat Storage Buckets
1. Di Supabase Dashboard, klik **Storage** di sidebar kiri
2. Klik **New bucket**

#### Bucket 1: `uploads` (File Uploads Umum)
- **Name**: `uploads`
- **Public bucket**: ✅ **YES** (untuk akses langsung dari frontend)
- **File size limit**: 10 MB (atau sesuai kebutuhan)
- **Allowed MIME types**: 
  - `image/*` (untuk gambar)
  - `application/pdf` (untuk PDF)
  - `application/msword` (untuk DOC)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (untuk DOCX)

#### Bucket 2: `covers` (Cover Images)
- **Name**: `covers`
- **Public bucket**: ✅ **YES**
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/*`

#### Bucket 3: `documents` (PDF/Documents)
- **Name**: `documents`
- **Public bucket**: ✅ **YES**
- **File size limit**: 50 MB
- **Allowed MIME types**: 
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

#### Bucket 4: `avatars` (User Photos)
- **Name**: `avatars`
- **Public bucket**: ✅ **YES**
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/*`

### 4.2 Setup Storage Policies

Setelah bucket dibuat, setup RLS policies untuk storage:

#### Policy untuk `uploads` bucket:
```sql
-- Allow public read
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- Allow authenticated users to update own files
CREATE POLICY "Authenticated users can update own files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete own files
CREATE POLICY "Authenticated users can delete own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');
```

#### Policy untuk `covers` bucket:
```sql
-- Allow public read
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');
```

#### Policy untuk `documents` bucket:
```sql
-- Allow public read
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
```

#### Policy untuk `avatars` bucket:
```sql
-- Allow public read
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to upload own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Cara menjalankan policies:**
1. Buka **SQL Editor**
2. Copy salah satu policy di atas
3. Paste dan klik **Run**
4. Ulangi untuk setiap policy

---

## 5. Environment Variables

### 5.1 Dapatkan API Keys
1. Di Supabase Dashboard, klik **Settings** (icon gear)
2. Klik **API**
3. Copy nilai berikut:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: String panjang (untuk client-side)
   - **service_role key**: String panjang (⚠️ **JANGAN expose di frontend!**)

### 5.2 Buat File `.env`
Buat file `.env` di root project:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (HANYA untuk backend/server-side)
# JANGAN gunakan di frontend!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5.3 Verifikasi `.gitignore`
Pastikan `.env` ada di `.gitignore`:
```
.env
.env.local
.env.*.local
```

---

## 6. Testing

### 6.1 Test Database Connection
1. Jalankan aplikasi: `npm run dev`
2. Buka browser console
3. Cek apakah ada error terkait Supabase connection

### 6.2 Test Authentication
1. Buka aplikasi
2. Coba registrasi user baru
3. Cek di Supabase Dashboard > **Authentication** > **Users**
4. User baru harus muncul di sana

### 6.3 Test Database Operations
1. Login sebagai admin
2. Coba tambah data (buletin, artikel, dll)
3. Cek di Supabase Dashboard > **Table Editor**
4. Data harus muncul di tabel yang sesuai

### 6.4 Test Storage
1. Upload file (gambar, PDF, dll)
2. Cek di Supabase Dashboard > **Storage**
3. File harus muncul di bucket yang sesuai
4. Cek URL file bisa diakses

### 6.5 Test RLS
1. Logout dari aplikasi
2. Coba akses data (harus bisa read public content)
3. Coba insert/update/delete (harus ditolak)
4. Login kembali
5. Coba insert/update/delete (harus berhasil)

---

## 🔒 Security Best Practices

### 1. RLS Policies
- ✅ Semua tabel sudah memiliki RLS enabled
- ✅ Public content bisa dibaca semua orang
- ✅ Hanya authenticated users yang bisa write
- ⚠️ Untuk production, pertimbangkan policy yang lebih ketat

### 2. API Keys
- ✅ Gunakan `anon key` di frontend
- ✅ Jangan expose `service_role key` di frontend
- ✅ Simpan keys di `.env` (jangan commit ke Git)

### 3. Storage
- ✅ Public buckets untuk file yang perlu diakses langsung
- ✅ Private buckets untuk file sensitif (jika diperlukan)
- ✅ File size limits sudah diset

### 4. Authentication
- ✅ Email confirmation untuk production
- ✅ Secure password requirements
- ✅ Rate limiting (built-in Supabase)

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🆘 Troubleshooting

### Error: "relation does not exist"
- Pastikan SQL schema sudah dijalankan
- Cek apakah semua tabel sudah dibuat

### Error: "permission denied"
- Cek RLS policies
- Pastikan user sudah authenticated
- Cek apakah policy sesuai dengan operasi yang dilakukan

### Error: "bucket not found"
- Pastikan bucket sudah dibuat di Storage
- Cek nama bucket (case-sensitive)

### Error: "invalid API key"
- Pastikan `.env` file sudah dibuat
- Pastikan key yang digunakan benar (anon key untuk frontend)
- Restart development server setelah mengubah `.env`

---

## ✅ Checklist Setup

- [ ] Supabase project dibuat
- [ ] Database password disimpan dengan aman
- [ ] SQL schema dijalankan
- [ ] Semua tabel terverifikasi
- [ ] RLS policies terverifikasi
- [ ] Storage buckets dibuat
- [ ] Storage policies dijalankan
- [ ] API keys didapatkan
- [ ] File `.env` dibuat
- [ ] Aplikasi bisa connect ke Supabase
- [ ] Authentication berfungsi
- [ ] Database operations berfungsi
- [ ] Storage upload berfungsi

---

**Setup selesai!** 🎉

Aplikasi sekarang menggunakan Supabase sebagai backend dengan Authentication, PostgreSQL + RLS, dan Storage.
