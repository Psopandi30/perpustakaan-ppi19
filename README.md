# Perpustakaan Digital PPI 19 Garut - Literasi Membaca

Aplikasi web untuk sistem perpustakaan digital PPI 19 Garut dengan fitur manajemen konten, live streaming, chat, dan notifikasi.

## 🚀 Fitur Utama

### Admin Panel
- ✅ Manajemen User (Approve, Edit, Delete)
- ✅ Kelola Live Streaming dengan chat
- ✅ Kelola Buletin
- ✅ Kelola Karya Tulis
- ✅ Kelola Buku Umum
- ✅ Kelola Karya Asatidz
- ✅ Kelola Materi Dakwah
- ✅ Kelola Khutbah Jum'at
- ✅ Kelola Informasi
- ✅ Chat dengan Pengguna
- ✅ Pengaturan (Nama, Password, Logo, Foto)

### User Dashboard
- ✅ Dashboard dengan berbagai konten
- ✅ Live Streaming dengan live chat
- ✅ Baca berbagai konten (Buletin, Karya Tulis, Buku, dll)
- ✅ Chat dengan Admin
- ✅ Upload Foto Profil
- ✅ Notifikasi real-time

## 📋 Prerequisites

- Node.js (v18 atau lebih baru)
- npm atau yarn

## 🛠️ Installation

1. Clone repository:
```bash
git clone <repository-url>
cd literasi_membaca_pesantren
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## 🔐 Default Login

**Admin:**
- Username: `admin`
- Password: `password` (dapat diubah di menu Pengaturan)

**User Demo:**
- Username: `Dinda21`
- Password: `password`

## 📁 Struktur Project

```
literasi_membaca_pesantren/
├── components/          # Komponen React
│   ├── icons/          # Icon components
│   └── ...             # Halaman dan modals
├── utils/              # Utility functions
├── types.ts            # TypeScript types
├── db.ts               # Database layer (localStorage)
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## ⚠️ Catatan Penting

### Data Storage
Aplikasi saat ini menggunakan **localStorage** untuk penyimpanan data. Ini berarti:
- Data tidak tersinkron antar device/browser
- Data bisa hilang jika user clear browser cache
- Tidak cocok untuk production dengan banyak user

### Keamanan
- Password disimpan dalam plain text (tidak di-hash)
- Tidak ada enkripsi data sensitif
- **Untuk production, sangat disarankan untuk:**
  - Migrate ke backend database
  - Implementasi password hashing (bcrypt)
  - Gunakan HTTPS
  - Implementasi JWT untuk session

## 🚀 Deployment

### Option 1: Vercel/Netlify (Frontend Only)
```bash
npm run build
# Upload folder dist/ ke Vercel/Netlify
```

**Catatan**: Masih perlu backend untuk data storage.

### Option 2: Supabase (Recommended)
1. Setup Supabase project
2. Create database tables
3. Update `db.ts` untuk menggunakan Supabase client
4. Deploy frontend ke Vercel/Netlify

### Option 3: VPS dengan Backend
1. Setup Node.js/Express backend
2. Setup PostgreSQL/MySQL database
3. Deploy frontend dan backend
4. Setup Nginx reverse proxy
5. Setup SSL certificate

## 📝 TODO untuk Production

- [ ] Migrate dari localStorage ke backend database
- [ ] Implementasi password hashing
- [ ] Tambahkan error boundary
- [ ] Implementasi code splitting
- [ ] Optimasi bundle size
- [ ] Tambahkan unit testing
- [ ] Setup CI/CD pipeline

## 🐛 Known Issues

1. Data tidak tersinkron antar device (karena localStorage)
2. Password tidak di-hash (security risk)
3. Bundle size besar (>500KB) - perlu code splitting

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Name/Team]

## 📞 Support

Untuk pertanyaan atau dukungan, silakan buat issue di repository ini.

---

**Status**: ✅ Fitur lengkap untuk testing/demo | ⚠️ Perlu backend migration untuk production

Lihat [REVIEW_KEBERSIAPAN.md](./REVIEW_KEBERSIAPAN.md) untuk review lengkap kesiapan publikasi.
