import React, { useState, useEffect } from 'react';
import { Package, LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, FileText, FileWarning, Bell, LogOut, Settings, ClipboardCheck, Send, Printer } from 'lucide-react';
import { useAppStore } from './store';
import { User, AppNotification } from './types';
import DashboardView from './views/DashboardView';
import MasterBarangView from './views/MasterBarangView';
import BarangMasukView from './views/BarangMasukView';
import BarangKeluarView from './views/BarangKeluarView';
import StockOpnameView from './views/StockOpnameView';
import LaporanView from './views/LaporanView';
import BeritaAcaraView from './views/BeritaAcaraView';
import LoginView from './views/LoginView';
import PengaturanView from './views/PengaturanView';
import PengajuanView from './views/PengajuanView';
import RiwayatCetakView from './views/RiwayatCetakView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const {
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
  } = useAppStore();

  if (dbError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 flex-col p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat Data dari Local Storage</h2>
        <p className="text-slate-600 mb-6 max-w-md">
          {dbError}
        </p>
        
        <div className="mt-8">
          <button 
            onClick={() => {
              setDbError(null);
              setLoaded(true);
            }}
            className="text-slate-500 hover:text-slate-700 underline text-sm"
          >
            Abaikan & Gunakan Mode Lokal Sementara
          </button>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 flex-col">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">Menghubungkan ke Database Lokal...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView users={users} onLogin={(u) => { 
      setCurrentUser(u); 
      if (['Petugas Sarpras', 'Kepala Sarpras'].includes(u.role)) {
        setActiveTab('masuk');
      } else {
        setActiveTab('dashboard'); 
      }
    }} />;
  }

  // RBAC: Roles that CAN edit/input transactions
  const canEdit = ['Super Admin', 'Admin Gudang', 'Kepala Sarpras', 'Petugas Sarpras'].includes(currentUser.role);

  const handleAddProduct = (p: any) => {
    if (!canEdit) return;
    setProducts([p, ...products]);
  };
  const handleUpdateProduct = (p: any) => {
    if (!canEdit) return;
    setProducts(products.map(item => item.id === p.id ? p : item));
  };
  const handleDeleteProduct = (id: string) => {
    if (!canEdit) return;
    if(window.confirm('Hapus data barang ini? Pastikan barang ini sudah tidak ada historinya atau sudah tidak digunakan.')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddPrintHistory = (title: string, params: any, type: 'Laporan' | 'Berita Acara') => {
    const newHistory = {
      id: `print-${Date.now()}`,
      documentNo: params.noBA || `LAP-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`,
      title,
      type,
      datePrinted: new Date().toISOString(),
      printedBy: currentUser?.name || 'Sistem',
      params
    };
    setPrintHistory([newHistory, ...printHistory]);
  };

  const handleProcessMasuk = (items: any[], details: any) => {
    if (!canEdit) return;
    
    // If entered by Sarpras, mark as Pending Sortir
    const isSarpras = ['Petugas Sarpras', 'Kepala Sarpras'].includes(currentUser.role);
    const status = isSarpras ? 'Pending' : 'Selesai';

    const newTrx = { id: Date.now().toString(), ...details, status, items };
    setHistoryMasuk([newTrx, ...historyMasuk]);

    if (isSarpras) {
      // Add Notification for Super Admin
      const notif: AppNotification = {
        id: `n-${Date.now()}`,
        type: 'SORT_REQUIRED',
        message: `Ada barang masuk baru dari Sarpras yang menunggu disortir.`,
        date: new Date().toISOString(),
        read: false,
        link: 'masuk'
      };
      setNotifications([notif, ...notifications]);
    } else {
      // Add stock directly if processed by admin
      const updatedProducts = products.map(p => {
        const itemIn = items.find(i => i.id === p.id);
        return itemIn ? { ...p, stock: p.stock + itemIn.qty } : p;
      });
      setProducts(updatedProducts);
    }
  };

  const handleDeleteMasuk = (id: string) => {
    const trx = historyMasuk.find(h => h.id === id);
    if (trx && trx.status === 'Selesai') {
      const updatedProducts = products.map(p => {
        const itemIn = trx.items.find(i => i.id === p.id && (!i.divisiTujuan || i.divisiTujuan === 'Gudang'));
        return itemIn ? { ...p, stock: p.stock - itemIn.qty } : p;
      });
      setProducts(updatedProducts);
    }
    setHistoryMasuk(historyMasuk.filter(h => h.id !== id));
  };

  const handleProcessKeluar = (items: any[], details: any) => {
    if (!canEdit) return;
    const updatedProducts = products.map(p => {
      const itemOut = items.find(i => i.id === p.id);
      return itemOut ? { ...p, stock: p.stock - itemOut.qty } : p;
    });
    setProducts(updatedProducts);
    setHistoryKeluar([{ id: Date.now().toString(), ...details, items }, ...historyKeluar]);
  };

  const handleDeleteKeluar = (id: string) => {
    const trx = historyKeluar.find(h => h.id === id);
    if (trx) {
      const updatedProducts = products.map(p => {
        const itemOut = trx.items.find(i => i.id === p.id);
        return itemOut ? { ...p, stock: p.stock + itemOut.qty } : p;
      });
      setProducts(updatedProducts);
    }
    setHistoryKeluar(historyKeluar.filter(h => h.id !== id));
  };

  const handleProcessOpname = (details: Omit<import('./types').StockOpname, 'id'>) => {
    if (!canEdit) return;
    
    const masukItems: any[] = [];
    const keluarItems: any[] = [];

    // Update master product stocks
    const updatedProducts = products.map(p => {
      const opnameItem = details.items.find(i => i.id === p.id);
      if (opnameItem && opnameItem.selisih !== 0) {
        if (opnameItem.selisih > 0) {
          masukItems.push({
            id: p.id,
            name: p.name,
            qty: opnameItem.selisih,
            unit: p.unit
          });
        } else if (opnameItem.selisih < 0) {
          keluarItems.push({
            id: p.id,
            name: p.name,
            qty: Math.abs(opnameItem.selisih),
            unit: p.unit
          });
        }
        return { ...p, stock: opnameItem.actualStock };
      }
      return p;
    });
    setProducts(updatedProducts);
    
    // Auto-create Barang Masuk for surplus
    if (masukItems.length > 0) {
      const newMasuk = {
        id: `OPM-M-${Date.now()}`,
        tanggal: details.tanggal,
        sumber: 'Penyesuaian Sistem (Opname)',
        vendor: '-',
        penerima: details.pic,
        keterangan: `Kelebihan stok dari hasil opname (Oleh: ${details.pic})`,
        status: 'Selesai' as const,
        items: masukItems
      };
      setHistoryMasuk(prev => [newMasuk, ...prev]);
    }

    // Auto-create Barang Keluar for shortage
    if (keluarItems.length > 0) {
      const newKeluar = {
        id: `OPM-K-${Date.now()}`,
        tanggal: details.tanggal,
        peminta: '-',
        divisi: 'Penyesuaian (Opname)',
        shift: '-',
        petugas: details.pic,
        items: keluarItems
      };
      setHistoryKeluar(prev => [newKeluar, ...prev]);
    }

    // Save to history
    setHistoryOpname([{ id: Date.now().toString(), ...details }, ...historyOpname]);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'master', label: 'Data Barang', icon: Package },
    { id: 'masuk', label: 'Barang Masuk', icon: ArrowDownToLine },
    { id: 'keluar', label: 'Barang Keluar', icon: ArrowUpFromLine },
    { id: 'pengajuan', label: 'Pengajuan', icon: Send },
    { id: 'opname', label: 'Stok Opname', icon: ClipboardCheck },
    { id: 'laporan', label: 'Laporan & Bulanan', icon: FileText },
    { id: 'berita', label: 'Berita Acara', icon: FileWarning },
    { id: 'riwayat', label: 'Riwayat Cetak', icon: Printer },
    { id: 'pengaturan', label: 'Pengaturan & Akun', icon: Settings },
  ];

  const allowedMenus = menuItems.filter(item => {
    if (['Super Admin', 'Admin Gudang'].includes(currentUser.role)) return true;
    if (['Yayasan', 'HRD', 'Direktur'].includes(currentUser.role)) {
      return ['dashboard', 'laporan', 'berita', 'riwayat'].includes(item.id);
    }
    if (['Kepala Sarpras', 'Petugas Sarpras'].includes(currentUser.role)) {
      return ['masuk', 'keluar', 'pengajuan'].includes(item.id);
    }
    return false;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden print:bg-white print:block print:h-auto">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col shrink-0 print:hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-teal-400 font-bold text-lg leading-tight uppercase tracking-wider">RSIA UMMI ATHAYYA</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Gudang & Inventaris</p>
          </div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase">Manajemen Utama</div>
          {allowedMenus.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                  isActive ? 'bg-teal-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 mr-3 flex items-center justify-center opacity-70">
                  <Icon size={16} />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 bg-slate-950 text-xs flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-teal-500 mr-3 flex items-center justify-center text-slate-900 font-bold">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-white truncate max-w-[100px]">{currentUser.name}</p>
              <p className="text-[9px] opacity-60 uppercase font-bold text-teal-300">{currentUser.role}</p>
            </div>
          </div>
          <button onClick={() => setCurrentUser(null)} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden print:block print:overflow-visible">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 print:hidden relative">
          <div className="flex items-center space-x-4">
            <h2 className="font-bold text-slate-700">{menuItems.find(m => m.id === activeTab)?.label}</h2>
            {canEdit ? (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase border border-green-200">Akses Edit</span>
            ) : (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase border border-amber-200">Akses Pantau</span>
            )}
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); markAllRead(); }} className="relative text-slate-400 hover:text-slate-600 focus:outline-none">
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border border-white">{unreadCount}</span>}
                <Bell size={18} />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden z-50">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between">
                    <span>Notifikasi</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} onClick={() => { if(n.link) setActiveTab(n.link); setShowNotifications(false); }} className={`p-3 text-xs border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${n.read ? 'opacity-60' : ''}`}>
                          <p className="font-medium text-slate-800">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(n.date).toLocaleString('id-ID')}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 italic">Belum ada notifikasi.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 print:p-0">
          <div className="print:m-0 h-full flex flex-col">
            {activeTab === 'dashboard' && <DashboardView products={products} historyMasuk={historyMasuk} historyKeluar={historyKeluar} />}
            {activeTab === 'master' && <MasterBarangView products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} />}
            {activeTab === 'masuk' && <BarangMasukView products={products} historyMasuk={historyMasuk} onProcessMasuk={handleProcessMasuk} onDelete={handleDeleteMasuk} currentUser={currentUser} users={users} setProducts={setProducts} setHistoryMasuk={setHistoryMasuk} settings={settings} />}
            {activeTab === 'keluar' && <BarangKeluarView products={products} historyKeluar={historyKeluar} onProcessKeluar={handleProcessKeluar} onDelete={handleDeleteKeluar} settings={settings} currentUser={currentUser} users={users} />}
            {activeTab === 'pengajuan' && <PengajuanView pengajuan={pengajuan} setPengajuan={setPengajuan} currentUser={currentUser} />}
            {activeTab === 'opname' && <StockOpnameView products={products} historyOpname={historyOpname} onProcessOpname={handleProcessOpname} canEdit={canEdit} />}
            {activeTab === 'laporan' && <LaporanView products={products} historyMasuk={historyMasuk} historyKeluar={historyKeluar} settings={settings} comments={comments} setComments={setComments} currentUser={currentUser} notifications={notifications} setNotifications={setNotifications} onPrint={(title, params) => handleAddPrintHistory(title, params, 'Laporan')} />}
            {activeTab === 'berita' && <BeritaAcaraView settings={settings} onPrint={(title, params) => handleAddPrintHistory(title, params, 'Berita Acara')} />}
            {activeTab === 'riwayat' && <RiwayatCetakView history={printHistory} products={products} historyMasuk={historyMasuk} historyKeluar={historyKeluar} settings={settings} comments={comments} setComments={setComments} currentUser={currentUser} notifications={notifications} setNotifications={setNotifications} />}
            {activeTab === 'pengaturan' && <PengaturanView users={users} setUsers={setUsers} settings={settings} setSettings={setSettings} currentUser={currentUser} />}
          </div>
        </div>
      </main>
    </div>
  );
}
