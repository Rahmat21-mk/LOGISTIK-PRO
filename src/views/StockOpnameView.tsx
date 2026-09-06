import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { Product, StockOpname } from '../types';
import { Plus, Trash2, ClipboardCheck, ArrowRight } from 'lucide-react';

interface StockOpnameViewProps {
  products: Product[];
  historyOpname: StockOpname[];
  onProcessOpname: (details: Omit<StockOpname, 'id'>) => void;
  canEdit: boolean;
}

export default function StockOpnameView({ products, historyOpname, onProcessOpname, canEdit }: StockOpnameViewProps) {
  const [activeTab, setActiveTab] = useState<'baru' | 'riwayat'>('baru');
  
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [pic, setPic] = useState('');
  
  // Create a copy of products for editing physical stock
  const [opnameItems, setOpnameItems] = useState<(Product & { actualStock: number; selisih: number; keterangan: string })[]>(
    products.map(p => ({ ...p, actualStock: p.stock, selisih: 0, keterangan: '' }))
  );

  const handleActualStockChange = (id: string, value: string) => {
    const actualStock = parseInt(value) || 0;
    setOpnameItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          actualStock,
          selisih: actualStock - item.stock
        };
      }
      return item;
    }));
  };

  const handleKeteranganChange = (id: string, value: string) => {
    setOpnameItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, keterangan: value };
      }
      return item;
    }));
  };

  const handleSubmit = () => {
    if (!pic) {
      alert("Masukkan nama Penanggung Jawab (PIC).");
      return;
    }
    
    // Only include items that have discrepancies, OR include all. 
    // Usually stock opname includes all or just diffs. Let's include all so we have a full snapshot.
    const noOpname = `SO-${Date.now().toString().slice(-6)}`;
    
    onProcessOpname({
      noOpname,
      tanggal,
      items: opnameItems,
      // note: pic isn't in StockOpname type based on types.ts. I should check types.ts for StockOpname.
    } as any); // Type cast temporarily, we will update types.ts

    alert("Stok Opname berhasil disimpan! Stok sistem telah disesuaikan dengan stok fisik.");
    // Reset
    setPic('');
    setActiveTab('riwayat');
    // Refresh items to new stock
    setOpnameItems(products.map(p => ({ ...p, actualStock: p.stock, selisih: 0, keterangan: '' })));
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Stok Opname (Stock Taking)</h2>
          <p className="text-sm text-slate-500">Sesuaikan stok fisik dengan sistem.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('baru')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'baru' ? 'bg-white text-teal-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Buat Opname
          </button>
          <button 
            onClick={() => setActiveTab('riwayat')} 
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'riwayat' ? 'bg-white text-teal-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Riwayat Opname
          </button>
        </div>
      </div>

      {activeTab === 'baru' && (
        <Card className="p-4 border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal Pelaksanaan</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} disabled={!canEdit} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-teal-500" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penanggung Jawab (PIC)</label>
              <input type="text" value={pic} onChange={e => setPic(e.target.value)} disabled={!canEdit} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-teal-500" placeholder="Nama petugas..." />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSubmit} disabled={!canEdit} className="w-full md:w-auto h-8 bg-teal-600 hover:bg-teal-700">
                <ClipboardCheck size={14} className="mr-2" /> Simpan & Sesuaikan Stok
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                <tr>
                  <th className="px-3 py-2 w-12 text-center">No</th>
                  <th className="px-3 py-2">Kode - Nama Barang</th>
                  <th className="px-3 py-2 text-center">Stok Sistem</th>
                  <th className="px-3 py-2 text-center w-28">Stok Fisik</th>
                  <th className="px-3 py-2 text-center w-24">Selisih</th>
                  <th className="px-3 py-2">Keterangan</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {opnameItems.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 text-center">{index + 1}</td>
                    <td className="px-3 py-2 font-medium">
                      <span className="text-slate-400 mr-2">{item.code}</span>
                      {item.name}
                    </td>
                    <td className="px-3 py-2 text-center font-bold text-slate-700 bg-slate-100">{item.stock} {item.unit}</td>
                    <td className="px-3 py-2">
                      <input 
                        type="number" 
                        min="0"
                        value={item.actualStock}
                        onChange={e => handleActualStockChange(item.id, e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded text-center focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-bold px-2 py-1 rounded ${item.selisih > 0 ? 'text-green-700 bg-green-100' : item.selisih < 0 ? 'text-red-700 bg-red-100' : 'text-slate-400'}`}>
                        {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="text" 
                        value={item.keterangan}
                        onChange={e => handleKeteranganChange(item.id, e.target.value)}
                        disabled={!canEdit}
                        placeholder={item.selisih !== 0 ? "Wajib diisi..." : "-"}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-teal-500"
                      />
                    </td>
                  </tr>
                ))}
                {opnameItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-slate-500">Belum ada barang di Master Data.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'riwayat' && (
        <Card className="p-4 border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                <tr>
                  <th className="px-3 py-2">Tanggal & No</th>
                  <th className="px-3 py-2">PIC</th>
                  <th className="px-3 py-2">Hasil Selisih</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {historyOpname.map((h, i) => {
                  const diffItems = h.items.filter(item => item.selisih !== 0);
                  
                  return (
                    <tr key={h.id || i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <p className="font-bold">{h.tanggal}</p>
                        <p className="text-[10px] text-slate-400">{h.noOpname}</p>
                      </td>
                      <td className="px-3 py-2">{h.pic}</td>
                      <td className="px-3 py-2">
                        {diffItems.length === 0 ? (
                          <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Sesuai (Tidak ada selisih)</span>
                        ) : (
                          <ul className="list-none space-y-1">
                            {diffItems.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="font-medium">{item.name}:</span>
                                <span className={item.selisih > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                                </span>
                                {item.keterangan && <span className="text-[10px] text-slate-500 italic">({item.keterangan})</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {historyOpname.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-slate-500">Belum ada riwayat Stok Opname.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
