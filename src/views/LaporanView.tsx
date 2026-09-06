import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { Product, BarangMasuk, BarangKeluar, AppSettings, LaporanComment, User, AppNotification } from '../types';
import { Printer, FileText, MessageSquare, Send } from 'lucide-react';
import KopSurat from '../components/KopSurat';

export default function LaporanView({ 
  products, 
  historyMasuk,
  historyKeluar,
  settings,
  comments,
  setComments,
  currentUser,
  notifications,
  setNotifications,
  onPrint,
  previewParams
}: { 
  products: Product[],
  historyMasuk: BarangMasuk[],
  historyKeluar: BarangKeluar[],
  settings: AppSettings,
  comments: LaporanComment[],
  setComments: (c: LaporanComment[]) => void,
  currentUser: User,
  notifications: AppNotification[],
  setNotifications: (n: AppNotification[]) => void,
  onPrint?: (title: string, params: any) => void,
  previewParams?: any
}) {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(previewParams?.startDate || firstDay);
  const [endDate, setEndDate] = useState(previewParams?.endDate || lastDay);
  const [reportType, setReportType] = useState(previewParams?.reportType || 'Rekap Bulanan');
  const [filterQuery, setFilterQuery] = useState(previewParams?.filterQuery || '');
  const [selectedProductId, setSelectedProductId] = useState(previewParams?.selectedProductId || '');
  const [newComment, setNewComment] = useState('');
  
  const printReport = () => {
    if (onPrint && !previewParams) {
      onPrint(`Laporan ${reportType} (${startDate} - ${endDate})`, { startDate, endDate, reportType, filterQuery, selectedProductId });
    }
    window.print();
  };

  const sTime = new Date(startDate).setHours(0,0,0,0);
  const eTime = new Date(endDate).setHours(23,59,59,999);

  const rekapData = products.map(p => {
    let masukRange = 0; let keluarRange = 0;
    let masukFuture = 0; let keluarFuture = 0;

    historyMasuk.forEach(h => {
      const hTime = new Date(h.tanggal).getTime();
      const item = h.items.find(i => i.id === p.id);
      if (item) {
          if (hTime >= sTime && hTime <= eTime) masukRange += item.qty;
          if (hTime > eTime) masukFuture += item.qty;
      }
    });

    historyKeluar.forEach(h => {
      const hTime = new Date(h.tanggal).getTime();
      const qtyOut = h.items.filter(i => i.id === p.id).reduce((sum, i) => sum + i.qty, 0);
      if (qtyOut > 0) {
          if (hTime >= sTime && hTime <= eTime) keluarRange += qtyOut;
          if (hTime > eTime) keluarFuture += qtyOut;
      }
    });

    const akhir = p.stock - masukFuture + keluarFuture;
    const awal = akhir - masukRange + keluarRange;

    return { ...p, awal, masuk: masukRange, keluar: keluarRange, akhir };
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const c: LaporanComment = {
      id: `c-${Date.now()}`,
      reportId: `${startDate}-${endDate}-${reportType}`,
      date: new Date().toLocaleString('id-ID'),
      author: currentUser.name,
      role: currentUser.role,
      text: newComment
    };
    setComments([...comments, c]);
    
    // Create notification if comment is from Yayasan or HRD
    if (['Yayasan', 'HRD'].includes(currentUser.role)) {
      const notif: AppNotification = {
        id: `n-${Date.now()}`,
        type: 'COMMENT',
        message: `Komentar baru dari ${currentUser.name} (${currentUser.role}) pada Laporan ${reportType}.`,
        date: new Date().toISOString(),
        read: false,
        link: 'laporan'
      };
      setNotifications([notif, ...notifications]);
    }
    
    setNewComment('');
  };

  const currentComments = comments.filter(c => c.reportId === `${startDate}-${endDate}-${reportType}`);

  const renderSignature = (title: string, name: string, useQR?: boolean) => {
    const qrData = encodeURIComponent(`Ditandatangani secara digital oleh: ${name} (${title})`);
    return (
      <div className="text-center w-40">
        <p className="font-bold text-[10px] mb-2">{title}</p>
        <div className="h-24 flex items-center justify-center my-2">
           {useQR ? (
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`} alt="QR" className="w-20 h-20 mix-blend-multiply border border-slate-300 p-0.5 bg-white" />
           ) : (
              <div className="h-full w-full border-b border-dashed border-slate-400 mt-12"></div>
           )}
        </div>
        <p className={`font-bold text-[10px] ${!useQR ? 'underline' : ''}`}>{name}</p>
      </div>
    );
  };

  // Prepare filtered data for Keluar per Divisi or Spesifik
  let filteredKeluar: any[] = [];
  if (reportType === 'Keluar Divisi' || reportType === 'Keluar Spesifik') {
    historyKeluar.forEach(h => {
      const hTime = new Date(h.tanggal).getTime();
      if (hTime >= sTime && hTime <= eTime) {
        if (reportType === 'Keluar Divisi' && filterQuery && h.divisi !== filterQuery) return;
        
        h.items.forEach(item => {
          if (reportType === 'Keluar Spesifik' && filterQuery && !item.name.toLowerCase().includes(filterQuery.toLowerCase())) return;
          
          filteredKeluar.push({
            tanggal: h.tanggal,
            divisi: h.divisi || 'Umum',
            peminta: h.peminta,
            ...item
          });
        });
      }
    });
  }

  // Riwayat Per Barang (Kartu Stok)
  const riwayatBarang: any[] = [];
  let riwayatProduct: Product | undefined;
  if (reportType === 'Riwayat Per Barang' && selectedProductId) {
    riwayatProduct = products.find(p => p.id === selectedProductId);
    if (riwayatProduct) {
      // Masuk
      historyMasuk.forEach(h => {
        const hTime = new Date(h.tanggal).getTime();
        if (hTime >= sTime && hTime <= eTime) {
          const item = h.items.find(i => i.id === selectedProductId);
          if (item) {
            riwayatBarang.push({
              rawTime: hTime,
              tanggal: h.tanggal,
              tipe: 'Masuk',
              referensi: h.vendor || h.sumber,
              pic: h.penerima,
              masuk: item.qty,
              keluar: 0,
              catatan: h.resi || h.keterangan || '-'
            });
          }
        }
      });
      // Keluar
      historyKeluar.forEach(h => {
        const hTime = new Date(h.tanggal).getTime();
        if (hTime >= sTime && hTime <= eTime) {
          const item = h.items.find(i => i.id === selectedProductId);
          if (item) {
            riwayatBarang.push({
              rawTime: hTime,
              tanggal: h.tanggal,
              tipe: 'Keluar',
              referensi: h.divisi || h.ruanganPenggantian || 'Umum',
              pic: h.petugas ? `${h.petugas} (Shift: ${h.shift})` : h.peminta,
              masuk: 0,
              keluar: item.qty,
              catatan: `Peminta: ${h.peminta}`
            });
          }
        }
      });
      // Sort by date ascending
      riwayatBarang.sort((a, b) => a.rawTime - b.rawTime);
      
      // Compute running balance (optional, currently it's just from 0 in this range, 
      // but let's just do a simple cumulative from 0 since we might not have initial stock easily)
      let currentSisa = 0; // We cannot easily know the exact stock on that start date without a full recompute, so we'll just show changes
      riwayatBarang.forEach(r => {
        currentSisa += r.masuk;
        currentSisa -= r.keluar;
        r.sisa = currentSisa; // Note: this is balance within the period, not absolute total
      });
    }
  }

  const isA4Portrait = reportType !== 'Rekap Bulanan';

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <style>{`
        @media print {
          @page { size: ${isA4Portrait ? 'A4 portrait' : 'A4 landscape'}; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; }
          /* Ensure tables don't break awkwardly */
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>
      
      <Card className={`p-4 print:hidden ${previewParams ? 'hidden' : ''}`}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800"><FileText className="text-teal-600" size={18} /> Laporan & Cetak</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal Awal</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal Akhir</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenis Laporan</label>
            <div className="flex gap-2">
              <select value={reportType} onChange={e => { setReportType(e.target.value); setFilterQuery(''); }} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded flex-1">
                <option value="Rekap Bulanan">Laporan Rekap Bulanan (Awal, Masuk, Keluar, Akhir)</option>
                <option value="Riwayat Per Barang">Laporan Riwayat (Kartu Stok) Per Barang</option>
                <option value="Keluar Divisi">Laporan Barang Keluar Per Divisi</option>
                <option value="Keluar Spesifik">Laporan Barang Keluar Spesifik (Kata Kunci)</option>
              </select>
              <Button onClick={printReport} icon={Printer} className="shrink-0 bg-teal-600 hover:bg-teal-700">Cetak PDF</Button>
            </div>
          </div>
        </div>
        
        {(reportType === 'Keluar Divisi' || reportType === 'Keluar Spesifik' || reportType === 'Riwayat Per Barang') && (
          <div className="mt-3 animate-in slide-in-from-top-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              {reportType === 'Riwayat Per Barang' ? 'Pilih Barang' : reportType === 'Keluar Divisi' ? 'Pilih Divisi' : 'Masukkan Kata Kunci Barang (Cth: Lampu)'}
            </label>
            {reportType === 'Riwayat Per Barang' ? (
              <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full md:w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded">
                <option value="">-- Pilih Barang --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                ))}
              </select>
            ) : reportType === 'Keluar Divisi' ? (
              <select value={filterQuery} onChange={e => setFilterQuery(e.target.value)} className="w-full md:w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded">
                <option value="">Semua Divisi</option>
                <option value="Poli Umum">Poli Umum</option>
                <option value="IGD">IGD</option>
                <option value="Rawat Inap">Rawat Inap</option>
                <option value="Farmasi / Apotek">Farmasi / Apotek</option>
                <option value="Laboratorium">Laboratorium</option>
                <option value="ATK / Perorangan">ATK / Perorangan</option>
                <option value="Sarpras">Sarpras</option>
              </select>
            ) : (
              <input type="text" value={filterQuery} onChange={e => setFilterQuery(e.target.value)} placeholder="Misal: lampu, kertas..." className="w-full md:w-1/2 px-2 py-1.5 text-xs border border-slate-200 rounded" />
            )}
          </div>
        )}
      </Card>

      <Card className="p-8 bg-white shadow-sm min-h-[297mm] mx-auto border border-slate-200 print:shadow-none print:p-0 print:w-full print:border-none">
        <KopSurat settings={settings} />

        <div className="text-center mb-6 mt-2">
          <h2 className="text-sm font-bold uppercase underline underline-offset-4">
            {reportType === 'Rekap Bulanan' ? 'LAPORAN REKONSILIASI STOK GUDANG' : 
             reportType === 'Riwayat Per Barang' ? `KARTU STOK: ${riwayatProduct?.name?.toUpperCase() || ''}` :
             reportType === 'Keluar Divisi' ? `LAPORAN BARANG KELUAR ${filterQuery ? `(DIVISI: ${filterQuery.toUpperCase()})` : ''}` :
             `LAPORAN BARANG KELUAR SPESIFIK ${filterQuery ? `("${filterQuery.toUpperCase()}")` : ''}`}
          </h2>
          <p className="text-[10px] mt-1 font-bold">PERIODE: {startDate} S/D {endDate}</p>
        </div>

        {reportType === 'Riwayat Per Barang' ? (
          <table className="w-full text-[11px] border-collapse border border-slate-800 mb-8">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-800 p-2 w-8">NO.</th>
                <th className="border border-slate-800 p-2">TANGGAL</th>
                <th className="border border-slate-800 p-2">JENIS</th>
                <th className="border border-slate-800 p-2">PIC / PEMINTA</th>
                <th className="border border-slate-800 p-2">REFERENSI / DIVISI</th>
                <th className="border border-slate-800 p-2">MASUK</th>
                <th className="border border-slate-800 p-2">KELUAR</th>
                <th className="border border-slate-800 p-2">CATATAN</th>
              </tr>
            </thead>
            <tbody>
              {riwayatBarang.length > 0 ? riwayatBarang.map((r, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border border-slate-800 p-2">{idx + 1}</td>
                  <td className="border border-slate-800 p-2">{new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="border border-slate-800 p-2 font-bold">{r.tipe.toUpperCase()}</td>
                  <td className="border border-slate-800 p-2">{r.pic}</td>
                  <td className="border border-slate-800 p-2">{r.referensi}</td>
                  <td className="border border-slate-800 p-2">{r.masuk > 0 ? r.masuk : '-'}</td>
                  <td className="border border-slate-800 p-2">{r.keluar > 0 ? r.keluar : '-'}</td>
                  <td className="border border-slate-800 p-2 text-left">{r.catatan}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="border border-slate-800 p-4 text-center italic text-slate-500">Tidak ada riwayat pergerakan stok untuk barang ini pada periode yang dipilih.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : reportType === 'Rekap Bulanan' ? (
          <>
          <table className="w-full text-[10px] border-collapse border border-slate-800 mb-8">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-800 p-1.5 w-8" rowSpan={2}>NO.</th>
                <th className="border border-slate-800 p-1.5" rowSpan={2}>KODE BARANG</th>
                <th className="border border-slate-800 p-1.5 text-left" rowSpan={2}>NAMA BARANG</th>
                <th className="border border-slate-800 p-1.5" rowSpan={2}>SATUAN</th>
                <th className="border border-slate-800 p-1.5" rowSpan={2}>HARGA</th>
                <th className="border border-slate-800 p-1.5" colSpan={2}>PERSEDIAAN AWAL</th>
                <th className="border border-slate-800 p-1.5" colSpan={2}>PERSEDIAAN MASUK</th>
                <th className="border border-slate-800 p-1.5" colSpan={2}>PERSEDIAAN KELUAR</th>
                <th className="border border-slate-800 p-1.5" colSpan={2}>PERSEDIAAN AKHIR</th>
              </tr>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-800 p-1.5">JUMLAH</th>
                <th className="border border-slate-800 p-1.5">HARGA TOTAL</th>
                <th className="border border-slate-800 p-1.5">JUMLAH</th>
                <th className="border border-slate-800 p-1.5">HARGA TOTAL</th>
                <th className="border border-slate-800 p-1.5">JUMLAH</th>
                <th className="border border-slate-800 p-1.5">HARGA TOTAL</th>
                <th className="border border-slate-800 p-1.5">JUMLAH</th>
                <th className="border border-slate-800 p-1.5">HARGA TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {rekapData.length > 0 ? (
                rekapData.map((r, i) => (
                  <tr key={r.id}>
                    <td className="border border-slate-800 p-1.5 text-center">{i + 1}</td>
                    <td className="border border-slate-800 p-1.5 text-center font-mono">{r.code}</td>
                    <td className="border border-slate-800 p-1.5 max-w-[120px] truncate">{r.name}</td>
                    <td className="border border-slate-800 p-1.5 text-center">{r.unit}</td>
                    <td className="border border-slate-800 p-1.5 text-right whitespace-nowrap">Rp {r.price.toLocaleString('id-ID')}</td>
                    
                    <td className="border border-slate-800 p-1.5 text-center">{r.awal}</td>
                    <td className="border border-slate-800 p-1.5 text-right whitespace-nowrap">Rp {(r.awal * r.price).toLocaleString('id-ID')}</td>
                    
                    <td className="border border-slate-800 p-1.5 text-center">{r.masuk}</td>
                    <td className="border border-slate-800 p-1.5 text-right whitespace-nowrap">Rp {(r.masuk * r.price).toLocaleString('id-ID')}</td>
                    
                    <td className="border border-slate-800 p-1.5 text-center">{r.keluar}</td>
                    <td className="border border-slate-800 p-1.5 text-right whitespace-nowrap">Rp {(r.keluar * r.price).toLocaleString('id-ID')}</td>
                    
                    <td className="border border-slate-800 p-1.5 text-center font-bold">{r.akhir}</td>
                    <td className="border border-slate-800 p-1.5 text-right font-bold bg-slate-50 whitespace-nowrap">Rp {(r.akhir * r.price).toLocaleString('id-ID')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                    Tidak ada data untuk direkap.
                  </td>
                </tr>
              )}
            </tbody>
            {rekapData.length > 0 && (
              <tfoot>
                <tr className="font-bold bg-slate-100">
                  <td colSpan={5} className="border border-slate-800 p-1.5 text-center">JUMLAH TOTAL ASET</td>
                  <td className="border border-slate-800 p-1.5 text-center">-</td>
                  <td className="border border-slate-800 p-1.5 text-right">Rp {rekapData.reduce((sum, r) => sum + (r.awal * r.price), 0).toLocaleString('id-ID')}</td>
                  <td className="border border-slate-800 p-1.5 text-center">-</td>
                  <td className="border border-slate-800 p-1.5 text-right">Rp {rekapData.reduce((sum, r) => sum + (r.masuk * r.price), 0).toLocaleString('id-ID')}</td>
                  <td className="border border-slate-800 p-1.5 text-center">-</td>
                  <td className="border border-slate-800 p-1.5 text-right">Rp {rekapData.reduce((sum, r) => sum + (r.keluar * r.price), 0).toLocaleString('id-ID')}</td>
                  <td className="border border-slate-800 p-1.5 text-center">-</td>
                  <td className="border border-slate-800 p-1.5 text-right bg-slate-200">Rp {rekapData.reduce((sum, r) => sum + (r.akhir * r.price), 0).toLocaleString('id-ID')}</td>
                </tr>
              </tfoot>
            )}
          </table>

          {rekapData.length > 0 && (
            <div className="mb-8 px-4 text-xs font-bold space-y-2">
              <div className="grid grid-cols-2 max-w-sm">
                <span>TOTAL ASET AWAL PERIODE</span>
                <span>: Rp {rekapData.reduce((sum, r) => sum + (r.awal * r.price), 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="grid grid-cols-2 max-w-sm">
                <span>TOTAL ASET MASUK PERIODE INI</span>
                <span>: Rp {rekapData.reduce((sum, r) => sum + (r.masuk * r.price), 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="grid grid-cols-2 max-w-sm">
                <span>TOTAL ASET TERPAKAI / KELUAR</span>
                <span>: Rp {rekapData.reduce((sum, r) => sum + (r.keluar * r.price), 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="grid grid-cols-2 max-w-sm border-t border-slate-400 pt-2 mt-2">
                <span>TOTAL ASET AKHIR PERIODE</span>
                <span>: Rp {rekapData.reduce((sum, r) => sum + (r.akhir * r.price), 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          )}
          </>
        ) : reportType === 'Keluar Spesifik' ? (
          <table className="w-full text-[11px] border-collapse border border-slate-800 mb-8">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-800 p-2 w-8">NO.</th>
                <th className="border border-slate-800 p-2">TANGGAL</th>
                <th className="border border-slate-800 p-2 text-left">NAMA BARANG</th>
                <th className="border border-slate-800 p-2 text-center">JUMLAH</th>
                <th className="border border-slate-800 p-2 text-left">DIVISI</th>
                <th className="border border-slate-800 p-2 text-left">RUANGAN PENGGANTIAN</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeluar.length > 0 ? (
                filteredKeluar.map((r, i) => (
                  <tr key={i}>
                    <td className="border border-slate-800 p-2 text-center">{i + 1}</td>
                    <td className="border border-slate-800 p-2 text-center">{new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="border border-slate-800 p-2">{r.name}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold text-teal-700">{r.qty} {r.unit}</td>
                    <td className="border border-slate-800 p-2">{r.divisi}</td>
                    <td className="border border-slate-800 p-2">{r.peminta}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                    Tidak ada riwayat barang keluar sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-[11px] border-collapse border border-slate-800 mb-8">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-800 p-2 w-8">NO.</th>
                <th className="border border-slate-800 p-2">TANGGAL</th>
                <th className="border border-slate-800 p-2 text-left">NAMA BARANG</th>
                <th className="border border-slate-800 p-2">KODE</th>
                <th className="border border-slate-800 p-2 text-center">QTY KELUAR</th>
                <th className="border border-slate-800 p-2 text-left">DIVISI</th>
                <th className="border border-slate-800 p-2 text-left">PEMINTA / PIC</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeluar.length > 0 ? (
                filteredKeluar.map((r, i) => (
                  <tr key={i}>
                    <td className="border border-slate-800 p-2 text-center">{i + 1}</td>
                    <td className="border border-slate-800 p-2 text-center">{new Date(r.tanggal).toLocaleDateString('id-ID')}</td>
                    <td className="border border-slate-800 p-2">{r.name}</td>
                    <td className="border border-slate-800 p-2 text-center font-mono">{r.code}</td>
                    <td className="border border-slate-800 p-2 text-center font-bold text-teal-700">{r.qty} {r.unit}</td>
                    <td className="border border-slate-800 p-2">{r.divisi}</td>
                    <td className="border border-slate-800 p-2">{r.peminta}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="border border-slate-800 p-6 text-center text-slate-500 italic">
                    Tidak ada riwayat barang keluar sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="flex justify-between px-4 pt-4 mt-8 break-inside-avoid">
          {renderSignature("ADMIN GUDANG", settings.namaAdmin, settings.useQRAdmin)}
          {renderSignature("DIREKTUR", settings.namaDirektur, settings.useQRDirektur)}
          {renderSignature("YAYASAN / PENGAWAS", settings.namaYayasan, settings.useQRYayasan)}
        </div>

        {/* Comments Section */}
        <div className="mt-16 border-t border-slate-200 pt-6 print:hidden">
          <h3 className="font-bold text-xs flex items-center gap-2 mb-4 text-slate-700"><MessageSquare size={14} /> Catatan & Komentar Pengawas</h3>
          <div className="space-y-3 mb-4">
            {currentComments.map(c => (
              <div key={c.id} className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-teal-700">{c.author} <span className="text-[9px] text-slate-400 font-normal uppercase bg-slate-200 px-1 rounded ml-1">{c.role}</span></span>
                  <span className="text-[10px] text-slate-400">{c.date}</span>
                </div>
                <p className="text-slate-700 whitespace-pre-wrap">{c.text}</p>
              </div>
            ))}
            {currentComments.length === 0 && <p className="text-[10px] text-slate-400 italic print:hidden">Belum ada catatan.</p>}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 print:hidden">
            <input 
              type="text" 
              value={newComment} 
              onChange={e => setNewComment(e.target.value)} 
              placeholder="Tambahkan catatan khusus laporan ini..." 
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <Button type="submit" disabled={!newComment.trim()} className="bg-slate-800 hover:bg-slate-900 h-8">
              <Send size={14} className="mr-2" /> Kirim
            </Button>
          </form>
        </div>

      </Card>
    </div>
  );
}
