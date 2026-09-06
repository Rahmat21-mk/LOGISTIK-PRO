# Sistem Manajemen Gudang RSIA UMMI ATHAYYA

Sistem informasi manajemen gudang dan inventaris yang dirancang khusus untuk memenuhi kebutuhan logistik Rumah Sakit Ibu dan Anak (RSIA) Ummi Athayya. Aplikasi ini menggunakan teknologi web modern (React) dengan sistem penyimpanan lokal (*Local Storage*), yang memungkinkan operasional berjalan sangat cepat tanpa memerlukan pengaturan server khusus.

## Fitur Utama

- **Master Data Barang**: Manajemen SKU, stok awal, dan ambang batas minimum stok (*minimum stock alert*).
- **Distribusi Barang Masuk**: Pencatatan penerimaan barang dari *supplier* lengkap dengan status sortir dan tanda terima serah terima.
- **Distribusi Barang Keluar**: Formulir distribusi ke berbagai unit/divisi di rumah sakit.
- **Formulir Khusus Teknisi**: Modul terpisah untuk serah-terima dan penggantian lampu/inventaris kelistrikan dengan dokumentasi ruangan.
- **Stok Opname**: Sinkronisasi stok fisik dengan data sistem.
- **Pengajuan & *Approval***: Sistem pengajuan permintaan barang antar unit yang disetujui (ACC) oleh manajemen.
- **Laporan & Berita Acara**: Pembuatan dokumen serah terima dan laporan bulanan siap cetak dalam format profesional.
- **Multi-Role Access**: Hak akses dan antarmuka berbeda berdasarkan peran pengguna (Super Admin, Admin Gudang, Sarpras, Yayasan, Direktur).

## Teknologi yang Digunakan

- **Frontend Framework**: React 19 dengan Vite
- **Styling**: Tailwind CSS v4
- **Iconography**: Lucide React
- **Penyimpanan**: Browser LocalStorage API (Offline First / Tanpa Server Backend)
- **Komponen Ekstra**: D3 & Recharts (Visualisasi Data)

## Panduan Penggunaan Lokal (Development)

Jika Anda ingin menjalankan atau memodifikasi kode sumber aplikasi ini secara lokal (di komputer Anda):

1. **Pastikan Node.js terinstal** di komputer Anda (versi LTS disarankan).
2. Buka terminal (Command Prompt / VS Code Terminal) pada *folder* repositori ini.
3. Jalankan perintah instalasi dependensi:
   ```bash
   npm install
   ```
4. Jalankan server simulasi lokal:
   ```bash
   npm run dev
   ```
5. Buka tautan `http://localhost:5173` (atau tautan lain yang muncul di terminal) melalui peramban web (browser).

## Publikasi / Deployment

Karena aplikasi ini sepenuhnya mengandalkan teknologi sisi-klien (*Client-Side / SPA*), Anda dapat mengunggah (hosting) secara gratis dan permanen tanpa perlu menyewa *database cloud* atau *server backend*.

Direkomendasikan untuk men-*deploy* melalui:
- **Vercel** (`vercel.com`)
- **Netlify** (`netlify.com`)
- **GitHub Pages**

## Hak Cipta & Lisensi
Sistem ini dibuat khusus untuk keperluan internal manajemen inventaris RSIA Ummi Athayya. Dilarang mendistribusikan kode tanpa izin terkait.
