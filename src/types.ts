export type Role = 'Super Admin' | 'Admin Gudang' | 'Kepala Sarpras' | 'Petugas Sarpras' | 'Yayasan' | 'HRD' | 'Direktur';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  password?: string;
}

export interface AppNotification {
  id: string;
  type: 'COMMENT' | 'SORT_REQUIRED' | 'INFO';
  message: string;
  read: boolean;
  date: string;
  link?: string;
}

export interface Pengajuan {
  id: string;
  tanggal: string;
  namaBarang: string;
  jumlah: number;
  keterangan: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  pemohon: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
  stock: number;
  price: number;
  minStock?: number;
}

export interface TransactionItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  qty: number;
  divisi?: string;
  petugas?: string;
  shift?: string;
  itemKey?: string;
  divisiTujuan?: string; // For incoming routing
  statusSortir?: 'Pending' | 'Selesai';
}

export interface BarangMasuk {
  id: string;
  tanggal: string;
  sumber: string;
  vendor: string;
  penerima: string;
  keterangan: string;
  resi?: string;
  foto?: string;
  status?: 'Pending' | 'Menunggu Serah Terima' | 'Selesai';
  tandaTanganSerahTerima?: string;
  namaPenerimaSerahTerima?: string;
  items: TransactionItem[];
}

export interface BarangKeluar {
  id: string;
  tanggal: string;
  peminta: string;
  shift?: string;
  divisi?: string;
  petugas?: string;
  ruanganPenggantian?: string;
  tandaTanganPenerima?: string;
  items: TransactionItem[];
}

export interface StockOpname {
  id: string;
  noOpname: string;
  tanggal: string;
  pic: string;
  items: (Product & { actualStock: number; selisih: number; keterangan: string })[];
}

export interface AppSettings {
  namaInstansi: string;
  alamatLengkap: string;
  namaAdmin: string;
  namaKepala: string;
  namaDirektur: string;
  namaYayasan: string;
  useQRAdmin?: boolean;
  useQRSarpras?: boolean;
  useQRDirektur?: boolean;
  useQRYayasan?: boolean;
  logoUrl?: string;
  logoPreview?: string;
  logoKananPreview?: string;
  kontakIG?: string;
  kontakFB?: string;
  kontakWA?: string;
  divisiOptions?: string[];
  ruanganOptions?: string[];
  shiftOptions?: string[];
}

export interface LaporanComment {
  id: string;
  reportId: string; // To link to a specific month/report
  date: string;
  author: string;
  role: string;
  text: string;
}

export interface PrintHistory {
  id: string;
  documentNo: string;
  title: string;
  type: 'Laporan' | 'Berita Acara';
  datePrinted: string;
  printedBy: string;
  params: any;
}
