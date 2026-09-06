import React from 'react';
import { Card } from '../components/ui';
import { Product, BarangMasuk, BarangKeluar } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardView({ 
  products, 
  historyMasuk, 
  historyKeluar 
}: { 
  products: Product[],
  historyMasuk: BarangMasuk[],
  historyKeluar: BarangKeluar[]
}) {
  const totalItems = products.length;
  const lowStock = products.filter(p => p.stock <= (p.minStock ?? 5)).length;
  const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);

  const chartData = [
    { name: 'Masuk', value: historyMasuk.length },
    { name: 'Keluar', value: historyKeluar.length },
  ];

  return (
    <div className="space-y-4 flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
      <section className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Item Aktif</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{totalItems}</p>
          <p className="text-[10px] text-teal-600 font-bold">Terdata di Sistem</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-amber-400">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Stok Menipis</p>
          <p className="text-2xl font-black text-amber-600 tracking-tight">{lowStock}</p>
          <p className="text-[10px] text-slate-500">Segera Re-order</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Fisik Barang</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{totalStock}</p>
          <p className="text-[10px] text-slate-400">Qty Tersedia</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Transaksi Hari Ini</p>
          <p className="text-2xl font-black text-slate-800 tracking-tight">{historyMasuk.length + historyKeluar.length}</p>
          <p className="text-[10px] text-teal-600 font-bold">Aktivitas</p>
        </div>
      </section>

      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="flex-[2] bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-700 uppercase">Statistik Transaksi Bulanan</h3>
          </div>
          <div className="flex-1 p-4 h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 10}} />
                <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="bg-teal-900 rounded-lg shadow-sm p-4 text-white flex-1 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xs font-bold uppercase mb-4 text-teal-300">Pemberitahuan Sistem</h3>
              <div className="space-y-4">
                {lowStock > 0 && (
                  <div className="flex items-start pb-3 border-b border-teal-800">
                    <span className="text-amber-400 mr-2 text-sm">⚠️</span>
                    <div>
                      <p className="text-xs font-bold">Stok Menipis</p>
                      <p className="text-[10px] text-teal-100 opacity-80">Terdapat {lowStock} item yang mendekati limit stok.</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start pb-3 border-b border-teal-800">
                  <span className="text-teal-400 mr-2 text-sm">📊</span>
                  <div>
                    <p className="text-xs font-bold">Laporan Harian</p>
                    <p className="text-[10px] text-teal-100 opacity-80">Jangan lupa cetak rekap stok masuk/keluar.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-800 rounded-full opacity-30"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
