import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { Product, BarangKeluar, TransactionItem } from '../types';
import { Plus, Trash2, ArrowUpFromLine, CheckCircle2 } from 'lucide-react';

export default function BarangKeluarView({ 
  products, 
  onProcessKeluar, 
  historyKeluar,
  onDelete,
  settings,
  currentUser,
  users
}: { 
  products: Product[], 
  onProcessKeluar: (items: TransactionItem[], details: any) => void,
  historyKeluar: BarangKeluar[],
  onDelete: (id: string) => void,
  settings: any,
  currentUser?: any,
  users?: any[]
}) {
  const [viewTab, setViewTab] = useState<'formulir' | 'formulir_lampu' | 'riwayat'>('formulir');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [addedItems, setAddedItems] = useState<TransactionItem[]>([]);
  
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [peminta, setPeminta] = useState('');
  const [divisi, setDivisi] = useState('');
  const [shift, setShift] = useState(settings?.shiftOptions?.[0] || 'Pagi');
  const [ruanganPenggantian, setRuanganPenggantian] = useState('');
  const [petugas, setPetugas] = useState(currentUser?.name || '');

  const isAdmin = currentUser && ['Super Admin', 'Admin Gudang'].includes(currentUser.role);
  const sarprasUsers = users ? users.filter(u => ['Petugas Sarpras', 'Kepala Sarpras'].includes(u.role)) : [];

  const handleAdd = () => {
    if (!selectedProductName || !quantity || parseInt(quantity) <= 0) return;
    
    // Find by full match (Code - Name) or just Name
    const product = products.find(p => 
      `${p.code} - ${p.name}`.toLowerCase() === selectedProductName.toLowerCase() ||
      p.name.toLowerCase() === selectedProductName.toLowerCase()
    );
    
    if (product) {
      if (product.stock < parseInt(quantity)) {
        alert(`Stok tidak mencukupi! Stok ${product.name} tersisa ${product.stock} ${product.unit}.`);
        return;
      }
      
      const existing = addedItems.find(i => i.id === product.id);
      if (existing) {
        if (product.stock < existing.qty + parseInt(quantity)) {
          alert(`Stok tidak mencukupi!`);
          return;
        }
        setAddedItems(addedItems.map(i => i.id === product.id ? { ...i, qty: i.qty + parseInt(quantity) } : i));
      } else {
        setAddedItems([...addedItems, { ...product, qty: parseInt(quantity) }]);
      }
      setSelectedProductName('');
      setQuantity('');
    } else {
      alert('Barang tidak ditemukan di master data.');
    }
  };

  const handleRemove = (id: string) => {
    setAddedItems(addedItems.filter(i => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addedItems.length === 0) {
      alert("Tambahkan minimal 1 barang.");
      return;
    }
    if (!divisi) {
      alert("Pilih Divisi / Unit Tujuan terlebih dahulu.");
      return;
    }
    onProcessKeluar(addedItems, { tanggal, peminta, divisi, shift, ruanganPenggantian, petugas });
    alert("Berhasil menyimpan barang keluar!");
    setAddedItems([]);
    setPeminta('');
    setDivisi('');
    setRuanganPenggantian('');
  };

  const handleSubmitLampu = (e: React.FormEvent) => {
    e.preventDefault();
    if (addedItems.length === 0) {
      alert("Tambahkan minimal 1 barang.");
      return;
    }
    if (!ruanganPenggantian) {
      alert("Pilih Ruangan Penggantian Lampu terlebih dahulu.");
      return;
    }
    onProcessKeluar(addedItems, { tanggal, peminta, divisi: 'Sarpras / Teknisi', shift, ruanganPenggantian, petugas });
    alert("Berhasil mencatat penggantian lampu!");
    setAddedItems([]);
    setPeminta('');
    setRuanganPenggantian('');
  };

  const lampuProducts = products.filter(p => p.name.toLowerCase().includes('lampu') && p.stock > 0);
  const DIVISI_OPTIONS = settings?.divisiOptions || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex gap-2 border-b border-slate-200 pb-2 shrink-0 overflow-x-auto">
        <button onClick={() => {setViewTab('formulir'); setAddedItems([]); setRuanganPenggantian('');}} className={`px-3 py-1.5 text-xs font-bold rounded whitespace-nowrap ${viewTab === 'formulir' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Formulir Distribusi Umum</button>
        <button onClick={() => {setViewTab('formulir_lampu'); setAddedItems([]); setRuanganPenggantian('');}} className={`px-3 py-1.5 text-xs font-bold rounded whitespace-nowrap ${viewTab === 'formulir_lampu' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Formulir Khusus Lampu</button>
        <button onClick={() => setViewTab('riwayat')} className={`px-3 py-1.5 text-xs font-bold rounded whitespace-nowrap ${viewTab === 'riwayat' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Riwayat Keluar</button>
      </div>

      <div className="flex-1 overflow-y-auto">
      {viewTab === 'formulir' && (
        <Card className="p-4 relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800"><ArrowUpFromLine className="text-teal-600" size={18} /> Pengeluaran / Distribusi Umum</h2>
              <Button type="submit" icon={CheckCircle2} className="h-9">Simpan Transaksi</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                <input type="date" required value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Divisi / Unit Tujuan</label>
                <select required value={divisi} onChange={e => setDivisi(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded">
                  <option value="" disabled>-- Pilih Divisi --</option>
                  {DIVISI_OPTIONS.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Peminta</label>
                <input type="text" required value={peminta} onChange={e => setPeminta(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="Nama petugas/perawat..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shift Petugas</label>
                <select value={shift} onChange={e => setShift(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded">
                  {settings?.shiftOptions?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Diinput Atas Nama (Petugas Sarpras)</label>
                  <select value={petugas} onChange={e => setPetugas(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-blue-50 border-blue-200 text-blue-900">
                    <option value="">-- Pilih Petugas Sarpras --</option>
                    {sarprasUsers.map((u: any) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                    <option value={currentUser?.name}>{currentUser?.name} (Admin)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4">
              <h3 className="font-bold mb-2 text-xs text-slate-700 uppercase">Tambahkan Barang</h3>
              <div className="flex flex-col md:flex-row gap-2">
                <input 
                  list="products-keluar" 
                  value={selectedProductName} 
                  onChange={e => setSelectedProductName(e.target.value)} 
                  className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded" 
                  placeholder="Ketik nama barang..."
                />
                <datalist id="products-keluar">
                  {products.filter(p => p.stock > 0).map(p => <option key={p.id} value={`${p.code} - ${p.name}`} />)}
                </datalist>

                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qty" className="w-20 px-2 py-1.5 text-xs border border-slate-200 rounded" min="1" />
                <Button type="button" onClick={handleAdd} variant="outline" icon={Plus}>Tambah</Button>
              </div>

              <div className="mt-3 space-y-1">
                {addedItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center px-3 py-2 bg-white border border-slate-200 rounded text-xs">
                    <p className="font-medium">{item.code} - {item.name}</p>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">-{item.qty} {item.unit}</span>
                      <button type="button" onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {addedItems.length === 0 && <p className="text-[10px] text-center text-slate-400 py-2">Belum ada barang ditambahkan.</p>}
              </div>
            </div>
          </form>
        </Card>
      )}

      {viewTab === 'formulir_lampu' && (
        <Card className="p-4 relative">
          <form onSubmit={handleSubmitLampu} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-amber-600"><ArrowUpFromLine className="text-amber-500" size={18} /> Pengeluaran Khusus Lampu</h2>
              <Button type="submit" icon={CheckCircle2} className="h-9">Simpan Penggantian</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal Penggantian</label>
                <input type="date" required value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Teknisi / Pelaksana</label>
                <input type="text" required value={peminta} onChange={e => setPeminta(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="Nama petugas sarpras..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Shift</label>
                <select value={shift} onChange={e => setShift(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded">
                  {settings?.shiftOptions?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Diinput Atas Nama (Petugas Sarpras)</label>
                  <select value={petugas} onChange={e => setPetugas(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-blue-50 border-blue-200 text-blue-900">
                    <option value="">-- Pilih Petugas Sarpras --</option>
                    {sarprasUsers.map((u: any) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                    <option value={currentUser?.name}>{currentUser?.name} (Admin)</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1">Ruangan Penggantian Lampu</label>
                <select required value={ruanganPenggantian} onChange={e => setRuanganPenggantian(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-amber-300 bg-amber-50 rounded text-amber-900 font-bold">
                  <option value="" disabled>-- Pilih Ruangan --</option>
                  {settings?.ruanganOptions?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200 mt-4">
              <h3 className="font-bold mb-2 text-xs text-amber-700 uppercase">Pilih Lampu yang Diganti</h3>
              <div className="flex flex-col md:flex-row gap-2">
                <input 
                  list="products-lampu" 
                  value={selectedProductName} 
                  onChange={e => setSelectedProductName(e.target.value)} 
                  className="flex-1 px-2 py-1.5 text-xs border border-amber-200 rounded" 
                  placeholder="Ketik nama lampu..."
                />
                <datalist id="products-lampu">
                  {lampuProducts.map(p => <option key={p.id} value={`${p.code} - ${p.name}`} />)}
                </datalist>

                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qty" className="w-20 px-2 py-1.5 text-xs border border-amber-200 rounded" min="1" />
                <Button type="button" onClick={handleAdd} variant="outline" icon={Plus}>Tambah</Button>
              </div>

              <div className="mt-3 space-y-1">
                {addedItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center px-3 py-2 bg-white border border-amber-200 rounded text-xs">
                    <p className="font-medium text-amber-900">{item.code} - {item.name}</p>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">-{item.qty} {item.unit}</span>
                      <button type="button" onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                {addedItems.length === 0 && <p className="text-[10px] text-center text-amber-500 py-2">Belum ada lampu ditambahkan.</p>}
              </div>
            </div>
          </form>
        </Card>
      )}

      {viewTab === 'riwayat' && (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 uppercase">Tanggal</th>
                <th className="px-3 py-2 uppercase">Divisi & Shift</th>
                <th className="px-3 py-2 uppercase">Peminta</th>
                <th className="px-3 py-2 uppercase">Item Keluar</th>
                <th className="px-3 py-2 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {historyKeluar.length > 0 ? historyKeluar.map((h, i) => (
                <tr key={h.id || i} className="hover:bg-slate-50">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(h.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">{h.divisi}</div>
                    <div className="text-[10px] text-slate-500">Shift: {h.shift} {h.petugas ? `| Petugas: ${h.petugas}` : ''}</div>
                  </td>
                  <td className="px-3 py-2 font-medium">{h.peminta}</td>
                  <td className="px-3 py-2">
                    <ul className="list-disc list-inside text-[10px] text-slate-600">
                      {h.items.map((item, idx) => (
                        <li key={idx}>{item.name} <strong className="text-amber-700">-{item.qty}</strong></li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => { if(confirm('Hapus transaksi keluar ini? Stok akan dikembalikan.')) onDelete(h.id); }} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-4 text-slate-400">Belum ada riwayat.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
      </div>
    </div>
  );
}
