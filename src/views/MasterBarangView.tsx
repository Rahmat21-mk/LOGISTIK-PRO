import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { Product } from '../types';
import { Search, Plus, Trash2 } from 'lucide-react';

export default function MasterBarangView({ 
  products, 
  onAddProduct, 
  onUpdateProduct,
  onDeleteProduct
}: { 
  products: Product[],
  onAddProduct: (p: Product) => void,
  onUpdateProduct: (p: Product) => void,
  onDeleteProduct?: (id: string) => void
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newProd, setNewProd] = useState<Partial<Product>>({ code: '', name: '', unit: 'Pcs', stock: 0, price: 0, minStock: 5 });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({ 
      id: Date.now().toString(), 
      code: newProd.code!, 
      name: newProd.name!, 
      unit: newProd.unit!, 
      stock: Number(newProd.stock), 
      price: Number(newProd.price),
      minStock: Number(newProd.minStock) || 0
    });
    setNewProd({ code: '', name: '', unit: 'Pcs', stock: 0, price: 0, minStock: 5 });
  };

  return (
    <Card className="p-4 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Master Data Barang</h2>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" placeholder="Cari barang..." 
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
        <h3 className="font-bold text-xs mb-3 text-slate-700 uppercase">Tambah Barang Baru</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kode</label>
            <input type="text" required value={newProd.code} onChange={e => setNewProd({...newProd, code: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="ATK-01" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Barang</label>
            <input type="text" required value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="Nama Produk" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Satuan</label>
            <select value={newProd.unit} onChange={e => setNewProd({...newProd, unit: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded">
              <option>Pcs</option><option>Kotak</option><option>Pack</option><option>Rim</option><option>Roll</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stok Awal</label>
            <input type="number" required value={newProd.stock} onChange={e => setNewProd({...newProd, stock: Number(e.target.value)})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min. Stok</label>
            <input type="number" required value={newProd.minStock} onChange={e => setNewProd({...newProd, minStock: Number(e.target.value)})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
          </div>
          <div className="md:col-span-1">
            <Button type="submit" className="w-full" icon={Plus}>Simpan</Button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 uppercase">Kode SKU</th>
              <th className="px-3 py-2 uppercase">Nama Barang</th>
              <th className="px-3 py-2 uppercase text-center">Unit</th>
              <th className="px-3 py-2 uppercase text-right">Stok</th>
              <th className="px-3 py-2 uppercase text-right">Min. Stok</th>
              <th className="px-3 py-2 uppercase text-center">Status</th>
              <th className="px-3 py-2 uppercase text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {filteredProducts.map(p => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-[10px]">{p.code}</td>
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2 text-center">{p.unit}</td>
                <td className="px-3 py-2 text-right font-bold">{p.stock}</td>
                <td className="px-3 py-2 text-right text-slate-500">{p.minStock ?? 5}</td>
                <td className="px-3 py-2 text-center">
                  {p.stock > (p.minStock ?? 5) ? <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase">Tersedia</span> : 
                   p.stock > 0 ? <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase">Menipis</span> : 
                   <span className="bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase">Kosong</span>}
                </td>
                <td className="px-3 py-2 text-center">
                  {onDeleteProduct && (
                    <button 
                      onClick={() => onDeleteProduct(p.id)} 
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                      title="Hapus Barang"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
