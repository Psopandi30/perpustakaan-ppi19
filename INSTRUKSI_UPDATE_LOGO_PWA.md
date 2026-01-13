# Instruksi Update Logo PWA

## Langkah-langkah Mengganti Logo PWA

### 1. Siapkan File Logo Baru
- Format: **PNG** (disarankan dengan transparansi)
- Ukuran: **512x512 pixels** (akan di-resize otomatis untuk ukuran lain)
- Nama file: `pwa-icon.png`
- Lokasi: `public/pwa-icon.png`

### 2. Spesifikasi Logo yang Disarankan
- **Ukuran minimal**: 512x512 pixels
- **Format**: PNG dengan transparansi (jika diperlukan)
- **Desain**: 
  - Logo harus jelas dan terlihat baik di ukuran kecil (192x192)
  - Hindari teks yang terlalu kecil
  - Gunakan warna kontras tinggi
  - Sesuai dengan brand colors: Dark Teal (#1A3A3A) dan Brand Yellow (#F5B92D)

### 3. Mengganti Logo
1. Hapus file lama: `public/pwa-icon.png`
2. Copy file logo baru ke folder `public/` dengan nama `pwa-icon.png`
3. Pastikan file logo baru memiliki ukuran minimal 512x512 pixels

### 4. Build Ulang Aplikasi
Setelah mengganti logo, jalankan:
```bash
npm run build
```

### 5. Clear Cache Browser (Jika Testing)
Jika testing di browser, clear cache atau gunakan mode incognito untuk melihat logo baru.

## Catatan
- Logo akan digunakan untuk:
  - Icon aplikasi di home screen (mobile)
  - Splash screen saat aplikasi dibuka
  - Tab browser (favicon)
  - PWA manifest
  - Apple touch icon

## Troubleshooting
Jika logo tidak muncul setelah build:
1. Pastikan file `pwa-icon.png` ada di folder `public/`
2. Clear cache browser
3. Uninstall PWA yang lama dan install ulang
4. Restart development server jika sedang development
