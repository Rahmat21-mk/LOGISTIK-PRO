import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { Send, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Pengajuan, User } from '../types';

export default function PengajuanView({ pengajuan, setPengajuan, currentUser }: { pengajuan: Pengajuan[], setPengajuan: any, currentUser: User }) {
  const [namaBarang, setNamaBarang] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const isAdmin = ['Super Admin', 'Admin Gudang'].includes(currentUser.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang || !jumlah) return;

    const newPengajuan: Pengajuan = {
      id: Date.now().toString(),
      tanggal: new Date().toISOString(),
      namaBarang,
      jumlah: Number(jumlah),
      keterangan,
      status: 'Pending',
      pemohon: currentUser.name
    };

    setPengajuan([newPengajuan, ...pengajuan]);
    setNamaBarang('');
    setJumlah('');
    setKeterangan('');
    alert('Pengajuan berhasil dikirim');
  };

  const handleUpdateStatus = (id: string, status: 'Disetujui' | 'Ditolak') => {
    setPengajuan(pengajuan.map(p => p.id === id ? { ...p, status } : p));
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Disetujui') return <CheckCircle size={16} className="text-green-500" />;
    if (status === 'Ditolak') return <XCircle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-amber-500" />;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-300 h-full">
      {!isAdmin && (
        <Card className="p-4 w-full xl:w-1/3 h-fit">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-teal-600" /> Form Pengajuan Barang Baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Barang</label>
              <input required type="text" value={namaBarang} onChange={e => setNamaBarang(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded" placeholder="Contoh: Tinta Printer Epson" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jumlah</label>
              <input required type="number" min="1" value={jumlah} onChange={e => setJumlah(e.target.value)} className="w-full p-2 text-xs border border-slate-200 rounded" placeholder="Jumlah" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Keterangan / Alasan</label>
              <textarea required value={keterangan} onChange={e => setKeterangan(e.target.value)} rows={3} className="w-full p-2 text-xs border border-slate-200 rounded resize-none" placeholder="Tinta printer di ruang pendaftaran sudah habis..." />
            </div>
            <Button type="submit" icon={Send} className="w-full bg-teal-600 hover:bg-teal-700">Kirim Pengajuan</Button>
          </form>
        </Card>
      )}

      <Card className="p-0 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Riwayat Pengajuan</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {pengajuan.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">Belum ada data pengajuan.</div>
            ) : (
              pengajuan.map(item => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{item.namaBarang}</h3>
                      <p className="text-[10px] text-slate-400">{new Date(item.tanggal).toLocaleString('id-ID')} - Oleh: {item.pemohon}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold">
                      <StatusIcon status={item.status} />
                      <span className={item.status === 'Disetujui' ? 'text-green-600' : item.status === 'Ditolak' ? 'text-red-600' : 'text-amber-600'}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mb-2">
                    <span className="font-semibold text-slate-800">Jumlah:</span> {item.jumlah} <br/>
                    <span className="font-semibold text-slate-800">Keterangan:</span> {item.keterangan}
                  </div>
                  {isAdmin && item.status === 'Pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button onClick={() => handleUpdateStatus(item.id, 'Disetujui')} className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-bold rounded">Setujui</button>
                      <button onClick={() => handleUpdateStatus(item.id, 'Ditolak')} className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold rounded">Tolak</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
