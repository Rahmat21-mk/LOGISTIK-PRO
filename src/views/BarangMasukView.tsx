import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { Product, BarangMasuk, TransactionItem, User, AppSettings } from '../types';
import { Plus, Trash2, ArrowDownToLine, CheckCircle2, Image as ImageIcon, Box } from 'lucide-react';

export default function BarangMasukView({ 
  products, 
  onProcessMasuk, 
  historyMasuk,
  onDelete,
  currentUser,
  setProducts,
  setHistoryMasuk,
  settings,
  users
}: { 
  products: Product[], 
  onProcessMasuk: (items: TransactionItem[], details: any) => void,
  historyMasuk: BarangMasuk[],
  onDelete: (id: string) => void,
  currentUser: User,
  setProducts: any,
  setHistoryMasuk: any,
  settings: AppSettings,
  users?: User[]
}) {
  const [viewTab, setViewTab] = useState<'formulir' | 'riwayat' | 'sortir' | 'serah_terima'>('formulir');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [addedItems, setAddedItems] = useState<TransactionItem[]>([]);
  
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [sumber, setSumber] = useState('Toko Online');
  const [vendor, setVendor] = useState('');
  const [penerima, setPenerima] = useState(currentUser.name);
  const [resi, setResi] = useState('');
  const [foto, setFoto] = useState<string>('');
  const [sortirDivisi, setSortirDivisi] = useState<{ [key: string]: string }>({});

  const isAdmin = ['Super Admin', 'Admin Gudang'].includes(currentUser.role);
  const isSarpras = ['Petugas Sarpras', 'Kepala Sarpras'].includes(currentUser.role);
  const sarprasUsers = users ? users.filter(u => ['Petugas Sarpras', 'Kepala Sarpras'].includes(u.role)) : [];
  const pendingSortir = historyMasuk.filter(h => h.status === 'Pending');
  const pendingSerahTerima = historyMasuk.filter(h => h.status === 'Menunggu Serah Terima');

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTTDUpload = (trxId: string, base64: string) => {
    setSortirDivisi(prev => ({ ...prev, [`ttd-${trxId}`]: base64 }));
  };

  const handlePenerimaChange = (trxId: string, val: string) => {
    setSortirDivisi(prev => ({ ...prev, [`penerima-${trxId}`]: val }));
  };

  const handleAdd = () => {
    if (!selectedProductId || !quantity || parseInt(quantity) <= 0) return;
    const product = products.find(p => p.id === selectedProductId);
    if (product) {
      const existing = addedItems.find(i => i.id === product.id);
      if (existing) {
        setAddedItems(addedItems.map(i => i.id === product.id ? { ...i, qty: i.qty + parseInt(quantity) } : i));
      } else {
        setAddedItems([...addedItems, { ...product, qty: parseInt(quantity) }]);
      }
      setSelectedProductId('');
      setQuantity('');
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
    onProcessMasuk(addedItems, { tanggal, vendor, penerima, sumber, resi, foto });
    alert("Berhasil menyimpan barang masuk!");
    setAddedItems([]);
    setVendor('');
    setResi('');
    setFoto('');
  };

  const handleSelesaikanSortir = (trxId: string) => {
    const trx = historyMasuk.find(h => h.id === trxId);
    if (!trx) return;

    const newItems = trx.items.map(item => ({
      ...item,
      divisiTujuan: sortirDivisi[`${trxId}-${item.id}`] || 'Gudang'
    }));

    // Update stock for items going to 'Gudang'
    const updatedProducts = [...products];
    newItems.forEach(item => {
      if (item.divisiTujuan === 'Gudang') {
        const prod = updatedProducts.find(p => p.id === item.id);
        if (prod) prod.stock += item.qty;
      }
    });

    const hasNonGudang = newItems.some(i => i.divisiTujuan !== 'Gudang');
    const nextStatus = hasNonGudang ? 'Menunggu Serah Terima' : 'Selesai';

    setProducts(updatedProducts);
    setHistoryMasuk(historyMasuk.map(h => h.id === trxId ? { ...h, status: nextStatus, items: newItems } : h));
    
    // Clear state
    const newSortirDivisi = { ...sortirDivisi };
    newItems.forEach(item => delete newSortirDivisi[`${trxId}-${item.id}`]);
    setSortirDivisi(newSortirDivisi);
    
    alert('Sortir selesai!');
  };

  const handleSelesaikanSerahTerima = (trxId: string) => {
    const trx = historyMasuk.find(h => h.id === trxId);
    if (!trx) return;
    const ttd = sortirDivisi[`ttd-${trxId}`];
    const nama = sortirDivisi[`penerima-${trxId}`];
    
    if (!ttd || !nama) {
      alert('Tanda tangan dan nama penerima wajib diisi!');
      return;
    }

    setHistoryMasuk(historyMasuk.map(h => h.id === trxId ? { ...h, status: 'Selesai', tandaTanganSerahTerima: ttd, namaPenerimaSerahTerima: nama } : h));
    
    const newSortirDivisi = { ...sortirDivisi };
    delete newSortirDivisi[`ttd-${trxId}`];
    delete newSortirDivisi[`penerima-${trxId}`];
    setSortirDivisi(newSortirDivisi);
    
    alert('Serah terima selesai!');
  };

  const DIVISI_OPTIONS = ['Gudang', 'Individu', ...(settings.divisiOptions || [])];

  return (
    <div className="space-y-4 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex gap-2 border-b border-slate-200 pb-2 shrink-0">
        <button onClick={() => setViewTab('formulir')} className={`px-3 py-1.5 text-xs font-bold rounded ${viewTab === 'formulir' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Formulir Input</button>
        <button onClick={() => setViewTab('riwayat')} className={`px-3 py-1.5 text-xs font-bold rounded ${viewTab === 'riwayat' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Riwayat Masuk</button>
        {isAdmin && (
          <button onClick={() => setViewTab('sortir')} className={`px-3 py-1.5 text-xs font-bold rounded flex gap-2 items-center ${viewTab === 'sortir' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            Sortir Barang <span className="bg-amber-400 text-amber-900 rounded-full px-1.5 py-0.5 text-[9px]">{pendingSortir.length}</span>
          </button>
        )}
        {isSarpras && (
          <button onClick={() => setViewTab('serah_terima')} className={`px-3 py-1.5 text-xs font-bold rounded flex gap-2 items-center ${viewTab === 'serah_terima' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            Serah Terima <span className="bg-amber-400 text-amber-900 rounded-full px-1.5 py-0.5 text-[9px]">{pendingSerahTerima.length}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
      {viewTab === 'formulir' && (
        <Card className="p-4 relative">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800"><ArrowDownToLine className="text-teal-600" size={18} /> Penerimaan Barang</h2>
              <Button type="submit" icon={CheckCircle2} className="h-9">Simpan Transaksi</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                <input type="date" required value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sumber Pemasok</label>
                <select value={sumber} onChange={e => setSumber(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded">
                  <option value="Toko Online">Toko Online</option>
                  <option value="Vendor / Supplier">Vendor / Supplier</option>
                  <option value="Hibah / Bantuan">Hibah / Bantuan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Pemasok/Toko</label>
                <input type="text" required value={vendor} onChange={e => setVendor(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="Nama supplier/toko..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penerima (Diinput Atas Nama)</label>
                {isAdmin ? (
                  <select required value={penerima} onChange={e => setPenerima(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-blue-50 border-blue-200 text-blue-900">
                    <option value="">-- Pilih Penerima --</option>
                    {sarprasUsers.map((u: any) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                    <option value={currentUser.name}>{currentUser.name} (Admin)</option>
                  </select>
                ) : (
                  <input type="text" required value={penerima} onChange={e => setPenerima(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-slate-100" readOnly={!isAdmin} placeholder="Nama admin/penerima..." />
                )}
              </div>
              
              {sumber === 'Toko Online' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">No. Resi (Opsional)</label>
                    <input type="text" value={resi} onChange={e => setResi(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="Contoh: JX123456789..." />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Foto Bukti Barang / Resi</label>
                    <div className="flex items-center gap-3">
                      <input type="file" accept="image/*" required={isSarpras} onChange={handleFotoUpload} className="w-full px-2 py-1 text-xs border border-slate-200 rounded file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                      {foto && (
                        <div className="h-10 w-10 shrink-0 border border-slate-200 rounded overflow-hidden">
                          <img src={foto} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h3 className="font-bold mb-2 text-xs text-slate-700 uppercase">Tambahkan Barang</h3>
              <div className="flex flex-col md:flex-row gap-2">
                <input 
                  list="products-masuk" 
                  value={selectedProductId ? products.find(p => p.id === selectedProductId)?.name || '' : ''} 
                  onChange={e => {
                    const p = products.find(prod => prod.name === e.target.value);
                    if (p) setSelectedProductId(p.id);
                  }} 
                  className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded" 
                  placeholder="Ketik nama barang..."
                />
                <datalist id="products-masuk">
                  {products.map(p => <option key={p.id} value={p.name} />)}
                </datalist>

                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Qty" className="w-20 px-2 py-1.5 text-xs border border-slate-200 rounded" min="1" />
                <Button type="button" onClick={handleAdd} variant="outline" icon={Plus}>Tambah</Button>
              </div>

              <div className="mt-3 space-y-1">
                {addedItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center px-3 py-2 bg-white border border-slate-200 rounded text-xs">
                    <p className="font-medium">{item.code} - {item.name}</p>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">+{item.qty} {item.unit}</span>
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

      {viewTab === 'riwayat' && (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 uppercase">Tanggal</th>
                <th className="px-3 py-2 uppercase">Vendor & Resi</th>
                <th className="px-3 py-2 uppercase">Penerima</th>
                <th className="px-3 py-2 uppercase">Item</th>
                <th className="px-3 py-2 uppercase text-center">Status</th>
                {isAdmin && <th className="px-3 py-2 uppercase text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {historyMasuk.length > 0 ? historyMasuk.map((h, i) => (
                <tr key={h.id || i} className="hover:bg-slate-50">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(h.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{h.vendor}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{h.resi || '-'}</div>
                  </td>
                  <td className="px-3 py-2">{h.penerima}</td>
                  <td className="px-3 py-2">
                    <ul className="list-disc list-inside text-[10px] text-slate-600">
                      {h.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} <strong className="text-slate-800">+{item.qty}</strong>
                          {item.divisiTujuan && item.divisiTujuan !== 'Gudang' && (
                            <span className="ml-1 text-[9px] bg-slate-200 px-1 rounded">-&gt; {item.divisiTujuan}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {h.status === 'Pending' ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold border border-amber-200 uppercase">Menunggu Sortir</span>
                    ) : h.status === 'Menunggu Serah Terima' ? (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold border border-blue-200 uppercase">Menunggu Serah Terima</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold border border-green-200 uppercase">Selesai</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => { if(confirm('Hapus transaksi ini? Stok akan dikembalikan.')) onDelete(h.id); }} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-4 text-slate-400">Belum ada riwayat.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {viewTab === 'serah_terima' && isSarpras && (
        <Card className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ArrowDownToLine className="text-blue-500" size={18} /> Serah Terima Barang</h2>
            <p className="text-xs text-slate-500">Barang yang telah disortir oleh Admin untuk divisi selain Gudang harus diserahterimakan. Unggah foto bukti tanda tangan penerima dari divisi bersangkutan.</p>
          </div>
          <div className="space-y-4">
            {pendingSerahTerima.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">Tidak ada barang yang menunggu serah terima.</div>
            ) : (
              pendingSerahTerima.map(trx => (
                <div key={trx.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(trx.tanggal).toLocaleDateString('id-ID')} - {trx.vendor}</p>
                      <p className="text-xs font-semibold text-slate-700">Resi: {trx.resi || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Daftar Barang (Non-Gudang):</p>
                    {trx.items.filter(i => i.divisiTujuan !== 'Gudang').map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100 text-xs">
                        <div>
                          <span className="font-bold">{item.name}</span> <span className="text-slate-500">({item.qty} {item.unit})</span>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">{item.divisiTujuan}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Penerima</label>
                      <input 
                        type="text" 
                        value={sortirDivisi[`penerima-${trx.id}`] || ''} 
                        onChange={(e) => handlePenerimaChange(trx.id, e.target.value)} 
                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" 
                        placeholder="Nama petugas yg menerima..." 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Foto Bukti / Tanda Tangan</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => handleTTDUpload(trx.id, reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} 
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                        {sortirDivisi[`ttd-${trx.id}`] && (
                          <div className="h-8 w-8 shrink-0 border border-slate-200 rounded overflow-hidden">
                            <img src={sortirDivisi[`ttd-${trx.id}`]} alt="Preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => handleSelesaikanSerahTerima(trx.id)} icon={CheckCircle2} className="h-8 text-xs">Selesaikan Serah Terima</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {viewTab === 'sortir' && isAdmin && (
        <Card className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Box size={18} className="text-amber-500" /> Sortir Barang Masuk</h2>
            <p className="text-xs text-slate-500">Tentukan tujuan divisi untuk barang yang diterima oleh Sarpras. Pilih "Gudang" agar stok bertambah di sistem Logistik. Jika dikirim ke divisi lain, stok logistik tidak akan bertambah.</p>
          </div>
          
          <div className="space-y-4">
            {pendingSortir.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">Tidak ada barang yang perlu disortir.</div>
            ) : (
              pendingSortir.map(trx => (
                <div key={trx.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(trx.tanggal).toLocaleDateString('id-ID')} - {trx.vendor}</p>
                      <p className="text-xs font-semibold text-slate-700">Resi: {trx.resi || '-'}</p>
                    </div>
                    <Button onClick={() => handleSelesaikanSortir(trx.id)} icon={CheckCircle2} className="h-8 text-xs bg-amber-500 hover:bg-amber-600">Selesaikan Sortir</Button>
                  </div>
                  <div className="space-y-2">
                    {trx.items.map(item => {
                      const key = `${trx.id}-${item.id}`;
                      return (
                        <div key={item.id} className="flex flex-col md:flex-row justify-between md:items-center bg-slate-50 p-2 rounded border border-slate-100 text-xs">
                          <div>
                            <span className="font-bold">{item.name}</span> <span className="text-slate-500">({item.qty} {item.unit})</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 md:mt-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Tujuan:</span>
                            <select 
                              value={sortirDivisi[key] || 'Gudang'} 
                              onChange={(e) => setSortirDivisi({ ...sortirDivisi, [key]: e.target.value })}
                              className="px-2 py-1 border border-slate-200 rounded text-xs"
                            >
                              {DIVISI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}
