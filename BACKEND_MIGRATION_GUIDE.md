# Backend Migration Guide - Supabase Setup

## 📋 Overview

Migrasi dari localStorage ke Supabase untuk:
- ✅ Password hashing otomatis
- ✅ Data tersinkron real-time
- ✅ Backup otomatis
- ✅ Scalable untuk banyak user
- ✅ Keamanan production-ready

---

## 🚀 Step 1: Setup Supabase Project

### 1.1 Buat Akun Supabase
1. Kunjungi: https://supabase.com
2. Klik "Start your project"
3. Login dengan GitHub/Google
4. Klik "New Project"

### 1.2 Buat Project Baru
- **Name**: `literasi-membaca-iai`
- **Database Password**: (simpan password ini!)
- **Region**: Pilih yang terdekat (Singapore recommended)
- **Pricing Plan**: Free tier (cukup untuk mulai)

### 1.3 Dapatkan API Keys
Setelah project dibuat, masuk ke **Settings > API**:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon/public key**: (untuk client-side)
- **service_role key**: (untuk server-side, JANGAN expose di frontend!)

---

## 🗄️ Step 2: Setup Database Schema

### 2.1 Buka SQL Editor
Di Supabase Dashboard, klik **SQL Editor** > **New Query**

### 2.2 Jalankan SQL Schema
Copy dan paste SQL dari file `supabase/schema.sql` ke SQL Editor, lalu klik "Run"

Schema akan membuat tabel:
- `users` - Data pengguna
- `bulletins` - Data buletin
- `written_works` - Data jurnal
- `general_books` - Data skripsi
- `karya_asatidz` - Data karya ulama
- `materi_dakwah` - Data materi dakwah
- `khutbah_jumat` - Data khutbah jumat
- `information` - Data informasi
- `radio_stream_data` - Data live streaming
- `chat_threads` - Data chat
- `chat_messages` - Data pesan chat
- `notifications` - Data notifikasi
- `settings` - Data pengaturan

---

## 📦 Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
```

---

## ⚙️ Step 4: Setup Environment Variables

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**PENTING**: 
- Jangan commit `.env` ke Git!
- Tambahkan `.env` ke `.gitignore`
- Gunakan `VITE_` prefix untuk Vite

---

## 🔐 Step 5: Setup Supabase Client

File `lib/supabase.ts` sudah dibuat. Update dengan URL dan key Anda.

---

## 📊 Step 6: Migrate Data

### 6.1 Export Data dari localStorage
Jalankan di browser console saat aplikasi masih menggunakan localStorage:

```javascript
// Export semua data
const data = {
  users: JSON.parse(localStorage.getItem('db_users') || '[]'),
  bulletins: JSON.parse(localStorage.getItem('db_bulletins') || '[]'),
  writtenWorks: JSON.parse(localStorage.getItem('db_written_works') || '[]'),
  generalBooks: JSON.parse(localStorage.getItem('db_general_books') || '[]'),
  // ... dll
};
console.log(JSON.stringify(data, null, 2));
```

### 6.2 Import ke Supabase
Gunakan script migration di `scripts/migrate-to-supabase.ts` atau import manual via Supabase Dashboard.

---

## ✅ Step 7: Testing

1. Test login dengan user yang sudah di-migrate
2. Test CRUD operations (create, read, update, delete)
3. Test real-time sync (buka di 2 browser berbeda)
4. Test authentication

---

## 🚨 Troubleshooting

### Error: "Invalid API key"
- Pastikan `VITE_SUPABASE_ANON_KEY` benar
- Pastikan menggunakan `anon` key, bukan `service_role` key

### Error: "relation does not exist"
- Pastikan sudah menjalankan SQL schema
- Cek di Supabase Dashboard > Table Editor

### Data tidak muncul
- Cek Row Level Security (RLS) policies
- Pastikan user sudah login
- Cek browser console untuk error

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- Supabase JS Client: https://supabase.com/docs/reference/javascript
- Authentication: https://supabase.com/docs/guides/auth

---

**Status**: 🚧 In Progress  
**Last Updated**: 2025-01-27

