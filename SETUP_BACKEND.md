# Setup Backend - Step by Step Guide

## 🎯 Tujuan
Migrasi dari localStorage ke Supabase untuk:
- ✅ Password hashing otomatis
- ✅ Data tersinkron real-time
- ✅ Backup otomatis
- ✅ Scalable untuk banyak user

---

## 📋 Prerequisites
- Akun GitHub/Google (untuk login Supabase)
- Node.js dan npm sudah terinstall
- Aplikasi sudah berjalan dengan localStorage

---

## 🚀 Step 1: Buat Supabase Project

### 1.1 Daftar ke Supabase
1. Kunjungi: https://supabase.com
2. Klik **"Start your project"**
3. Login dengan GitHub atau Google
4. Klik **"New Project"**

### 1.2 Isi Detail Project
- **Name**: `literasi-membaca-iai` (atau nama lain)
- **Database Password**: Buat password yang kuat (simpan di tempat aman!)
- **Region**: Pilih **Singapore** (terdekat dengan Indonesia)
- **Pricing Plan**: Pilih **Free** (cukup untuk mulai)

### 1.3 Tunggu Project Siap
- Proses setup memakan waktu 1-2 menit
- Tunggu sampai status project menjadi "Active"

---

## 🔑 Step 2: Dapatkan API Keys

### 2.1 Buka Settings
1. Di Supabase Dashboard, klik **Settings** (icon gear di sidebar kiri)
2. Klik **API**

### 2.2 Copy Credentials
Anda akan melihat:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: String panjang (ini yang kita pakai di frontend)
- **service_role key**: String panjang (JANGAN expose di frontend!)

**Copy kedua nilai ini!**

---

## 🗄️ Step 3: Setup Database Schema

### 3.1 Buka SQL Editor
1. Di Supabase Dashboard, klik **SQL Editor** di sidebar kiri
2. Klik **New Query**

### 3.2 Jalankan Schema
1. Buka file `supabase/schema.sql` di project Anda
2. Copy semua isi file tersebut
3. Paste ke SQL Editor di Supabase
4. Klik **Run** (atau tekan Ctrl+Enter)

### 3.3 Verifikasi
1. Klik **Table Editor** di sidebar kiri
2. Anda harus melihat semua tabel:
   - users
   - settings
   - bulletins
   - written_works
   - general_books
   - karya_asatidz
   - materi_dakwah
   - khutbah_jumat
   - information
   - radio_stream_data
   - chat_messages
   - chat_threads
   - notifications

---

## ⚙️ Step 4: Setup Environment Variables

### 4.1 Buat File .env
Di root project, buat file `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Ganti dengan nilai dari Step 2!**

### 4.2 Verifikasi .env di .gitignore
Pastikan file `.env` sudah ada di `.gitignore` (sudah otomatis ditambahkan).

---

## 🧪 Step 5: Test Koneksi

### 5.1 Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 5.2 Cek Browser Console
1. Buka aplikasi di browser
2. Buka Developer Tools (F12)
3. Cek Console
4. Jika ada warning tentang Supabase, berarti env vars belum di-set
5. Jika tidak ada warning, berarti koneksi berhasil!

---

## 📊 Step 6: Migrate Data (Opsional)

### 6.1 Export Data dari localStorage
Saat aplikasi masih menggunakan localStorage, buka browser console dan jalankan:

```javascript
// Export data
const exportData = {
  users: JSON.parse(localStorage.getItem('db_users') || '[]'),
  bulletins: JSON.parse(localStorage.getItem('db_bulletins') || '[]'),
  writtenWorks: JSON.parse(localStorage.getItem('db_written_works') || '[]'),
  generalBooks: JSON.parse(localStorage.getItem('db_general_books') || '[]'),
  karyaAsatidz: JSON.parse(localStorage.getItem('db_karya_asatidz') || '[]'),
  materiDakwah: JSON.parse(localStorage.getItem('db_materi_dakwah') || '[]'),
  khutbahJumat: JSON.parse(localStorage.getItem('db_khutbah_jumat') || '[]'),
  information: JSON.parse(localStorage.getItem('db_information') || '[]'),
  radioStreamData: JSON.parse(localStorage.getItem('db_radio_stream_data') || '{}'),
  chatThreads: JSON.parse(localStorage.getItem('db_chat_threads') || '{}'),
  notifications: JSON.parse(localStorage.getItem('db_notifications') || '[]'),
  settings: JSON.parse(localStorage.getItem('db_settings') || '{}')
};

// Copy hasilnya
console.log(JSON.stringify(exportData, null, 2));
```

### 6.2 Import ke Supabase
Gunakan Supabase Dashboard > Table Editor untuk import data secara manual, atau gunakan script migration (akan dibuat nanti).

---

## ✅ Step 7: Verifikasi

### Checklist:
- [ ] Supabase project sudah dibuat
- [ ] Database schema sudah dijalankan
- [ ] File `.env` sudah dibuat dengan credentials yang benar
- [ ] Dev server sudah di-restart
- [ ] Tidak ada error di browser console
- [ ] Tabel-tabel sudah muncul di Supabase Dashboard

---

## 🚨 Troubleshooting

### Error: "Invalid API key"
- Pastikan `VITE_SUPABASE_ANON_KEY` benar (copy semua karakter)
- Pastikan menggunakan `anon` key, bukan `service_role` key
- Pastikan tidak ada spasi di awal/akhir

### Error: "relation does not exist"
- Pastikan sudah menjalankan SQL schema
- Cek di Supabase Dashboard > Table Editor apakah tabel sudah ada

### Warning: "Supabase environment variables not found"
- Pastikan file `.env` ada di root project
- Pastikan nama variabel benar: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
- Restart dev server setelah membuat/mengubah `.env`

### Data tidak muncul
- Cek Row Level Security (RLS) policies
- Pastikan sudah login (jika menggunakan auth)
- Cek browser console untuk error detail

---

## 📚 Next Steps

Setelah setup selesai:
1. ✅ Update `db.ts` untuk menggunakan Supabase (akan dibuat)
2. ✅ Implementasi authentication dengan Supabase Auth
3. ✅ Testing semua fitur
4. ✅ Deploy ke production

---

**Status**: 🚧 Setup Infrastructure - DONE  
**Next**: Update db.ts untuk menggunakan Supabase API

