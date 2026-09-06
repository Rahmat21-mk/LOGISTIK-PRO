import { useState, useEffect } from 'react';
import { Product, BarangMasuk, BarangKeluar, StockOpname, AppSettings, User, LaporanComment, AppNotification, Pengajuan, PrintHistory } from './types';

const defaultProducts: Product[] = [
  { id: '1', code: 'ATK-PEN-00', name: 'Pena', unit: 'Pcs', stock: 352, price: 1000 },
  { id: '2', code: 'ATK-STB-00', name: 'Stabilo', unit: 'Pcs', stock: 11, price: 1500 },
  { id: '32', code: 'ELK-LMP-09', name: 'Lampu 9 Watt', unit: 'Pcs', stock: 10, price: 15000 },
  { id: '33', code: 'ELK-LMP-12', name: 'Lampu 12 Watt', unit: 'Pcs', stock: 33, price: 20000 },
  { id: '101', code: 'MED-PAR-500', name: 'Paracetamol 500mg', unit: 'Box', stock: 150, price: 15000 },
  { id: '102', code: 'ALK-SNT-01', name: 'Spuit 3cc', unit: 'Box', stock: 45, price: 45000 },
  { id: '103', code: 'MED-AMX-500', name: 'Amoxicillin 500mg', unit: 'Box', stock: 80, price: 25000 },
  { id: '104', code: 'ALK-GLV-M', name: 'Sarung Tangan Medis (M)', unit: 'Box', stock: 120, price: 35000 },
];

const defaultUsers: User[] = [
  { id: 'u1', username: 'superadmin', name: 'Super Admin', role: 'Super Admin', password: 'Gudang1341Rh' },
  { id: 'u2', username: 'admin', name: 'Admin Gudang', role: 'Admin Gudang', password: 'admin' },
  { id: 'u3', username: 'yayasan', name: 'Ketua Yayasan', role: 'Yayasan', password: 'yayasan' },
  { id: 'u4', username: 'sarpras', name: 'Petugas Sarpras', role: 'Petugas Sarpras', password: 'sarpras' }
];

export function useAppStore() {
  const [loaded, setLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [historyMasuk, setHistoryMasuk] = useState<BarangMasuk[]>([]);
  const [historyKeluar, setHistoryKeluar] = useState<BarangKeluar[]>([]);
  const [historyOpname, setHistoryOpname] = useState<StockOpname[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
      namaInstansi: 'RUMAH SAKIT IBU DAN ANAK\nUMMI ATHAYYA',
      alamatLengkap: 'JL. KH. Ahmad Dahlan, Candra Mukti Tulang Bawang Tengah\nKabupaten Tulang Bawang Barat',
      kontakIG: 'rsiaummiathayya_tubaba',
      kontakFB: 'Rsia Ummi Athayya Tubaba',
      kontakWA: '0822-8903-4048',
      namaAdmin: 'Admin Gudang',
      namaKepala: 'Kepala Sarpras',
      namaDirektur: 'Direktur Utama',
      namaYayasan: 'Ketua Yayasan',
      useQRAdmin: false,
      useQRSarpras: false,
      useQRDirektur: false,
      useQRYayasan: false,
      divisiOptions: ['Gudang', 'Apotek', 'Laboratorium', 'Radiologi', 'Kantor', 'IGD', 'Poli Kandungan', 'Poli Anak', 'Ruang Operasi / OK', 'Rawat Inap', 'Lobby / Pendaftaran', 'Toilet', 'Lainnya'],
      ruanganOptions: ['IGD', 'Poli Kandungan', 'Poli Anak', 'Ruang Operasi / OK', 'Rawat Inap 1', 'Rawat Inap 2', 'Apotek', 'Laboratorium', 'Radiologi', 'Lobby / Pendaftaran', 'Kantor', 'Toilet', 'Luar Gedung'],
      shiftOptions: ['Pagi', 'Siang', 'Malam', 'Non-Shift'],
  });
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [comments, setComments] = useState<LaporanComment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]);
  const [printHistory, setPrintHistory] = useState<PrintHistory[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('gudang_local_db');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.products && data.products.length > 0) setProducts(data.products);
        if (data.historyMasuk && data.historyMasuk.length > 0) setHistoryMasuk(data.historyMasuk);
        if (data.historyKeluar && data.historyKeluar.length > 0) setHistoryKeluar(data.historyKeluar);
        if (data.historyOpname && data.historyOpname.length > 0) setHistoryOpname(data.historyOpname);
        if (data.settings && Object.keys(data.settings).length > 0) setSettings(data.settings);
        if (data.users && data.users.length > 0) setUsers(data.users);
        if (data.comments && data.comments.length > 0) setComments(data.comments);
        if (data.notifications && data.notifications.length > 0) setNotifications(data.notifications);
        if (data.pengajuan && data.pengajuan.length > 0) setPengajuan(data.pengajuan);
        if (data.printHistory && data.printHistory.length > 0) setPrintHistory(data.printHistory);
      }
    } catch (err) {
      console.error('Error fetching data from LocalStorage:', err);
      setDbError('Gagal memuat data lokal');
    } finally {
      setLoaded(true);
    }
  }, []);

  // Sync back to LocalStorage
  useEffect(() => {
    if (!loaded) return;

    const timer = setTimeout(() => {
      try {
        const data = {
          products, historyMasuk, historyKeluar, historyOpname, 
          settings, users, comments, notifications, pengajuan, printHistory
        };
        localStorage.setItem('gudang_local_db', JSON.stringify(data));
      } catch (err) {
        console.error('Error syncing to LocalStorage:', err);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [loaded, products, historyMasuk, historyKeluar, historyOpname, settings, users, comments, notifications, pengajuan, printHistory]);

  return {
    loaded, setLoaded,
    dbError, setDbError,
    products, setProducts,
    historyMasuk, setHistoryMasuk,
    historyKeluar, setHistoryKeluar,
    historyOpname, setHistoryOpname,
    settings, setSettings,
    users, setUsers,
    comments, setComments,
    notifications, setNotifications,
    pengajuan, setPengajuan,
    printHistory, setPrintHistory
  };
}
