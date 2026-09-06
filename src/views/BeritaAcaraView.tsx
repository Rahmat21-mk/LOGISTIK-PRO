import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { Printer, FileWarning, Edit } from 'lucide-react';
import { AppSettings } from '../types';
import KopSurat from '../components/KopSurat';

export default function BeritaAcaraView({ 
  settings,
  onPrint,
  previewParams
}: { 
  settings: AppSettings,
  onPrint?: (title: string, params: any) => void,
  previewParams?: any
}) {
  const printReport = () => {
    if (onPrint && !previewParams) {
      onPrint(`${jenisBA} - ${noBA}`, { 
        jenisBA, 
        noBA, 
        date, 
        pihak1Nama, 
        pihak1Jabatan, 
        pihak2Nama, 
        pihak2Jabatan, 
        keterangan, 
        pasal 
      });
    }
    window.print();
  };
  
  const renderSignature = (title: string, name: string, jabatan: string, useQR?: boolean) => {
    const qrData = encodeURIComponent(`Ditandatangani secara digital oleh: ${name} (${jabatan})`);
    return (
      <div className="text-center w-40 text-[13px]">
        <p className="font-bold mb-2">{title}</p>
        <div className="h-24 flex items-center justify-center my-2">
           {useQR ? (
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`} alt="QR" className="w-20 h-20 mix-blend-multiply border border-slate-300 p-0.5 bg-white" />
           ) : (
              <div className="h-full w-full border-b border-dashed border-slate-400 mt-12"></div>
           )}
        </div>
        <p className={`font-bold uppercase ${!useQR ? 'underline' : ''}`}>{name}</p>
        <p>{jabatan}</p>
      </div>
    );
  };

  const today = new Date();
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const defaultDateStr = today.toISOString().split('T')[0];

  const [jenisBA, setJenisBA] = useState(previewParams?.jenisBA || 'Kerusakan / Kehilangan');
  const [noBA, setNoBA] = useState(previewParams?.noBA || `01/BA-LOG/RSIA-UA/${today.getFullYear()}`);
  const [date, setDate] = useState(previewParams?.date || defaultDateStr);
  const [pihak1Nama, setPihak1Nama] = useState(previewParams?.pihak1Nama || settings.namaAdmin);
  const [pihak1Jabatan, setPihak1Jabatan] = useState(previewParams?.pihak1Jabatan || 'Admin Gudang / Logistik');
  const [pihak2Nama, setPihak2Nama] = useState(previewParams?.pihak2Nama || settings.namaKepala);
  const [pihak2Jabatan, setPihak2Jabatan] = useState(previewParams?.pihak2Jabatan || 'Kepala Bagian Sarpras');
  const [keterangan, setKeterangan] = useState(previewParams?.keterangan || '1. Telah ditemukan kerusakan pada ...\n2. Mohon untuk segera ditindaklanjuti...');
  const [pasal, setPasal] = useState(previewParams?.pasal || 'Berdasarkan SOP Rumah Sakit Nomor X Tahun Y, segala bentuk kerusakan aset wajib dilaporkan maksimal 2x24 jam...');

  // Parse chosen date
  const parsedDate = new Date(date);
  const hari = dayNames[parsedDate.getDay()] || '...';
  const tgl = parsedDate.getDate() || '...';
  const bln = monthNames[parsedDate.getMonth()] || '...';
  const thn = parsedDate.getFullYear() || '...';

  const handleJenisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setJenisBA(val);
    if (val === 'Kerusakan / Kehilangan') {
      setKeterangan('1. Telah ditemukan kerusakan pada aset [NAMA BARANG]\n2. Kerusakan diperkirakan terjadi pada [WAKTU]\n3. Tindakan awal yang dilakukan: [TINDAKAN]');
      setPasal('Berdasarkan SOP Rumah Sakit Nomor X Tahun Y, segala bentuk kerusakan aset wajib dilaporkan dan dilakukan investigasi lebih lanjut oleh pihak Sarpras.');
    } else if (val === 'Serah Terima Barang') {
      setKeterangan('1. Pihak Pertama telah menyerahkan barang berupa [JUMLAH] unit [NAMA BARANG] kepada Pihak Kedua.\n2. Barang dalam kondisi baik dan berfungsi normal.');
      setPasal('Sesuai dengan ketentuan Serah Terima Aset Perusahaan, hak dan tanggung jawab atas barang beralih ke Pihak Kedua setelah berita acara ini ditandatangani.');
    } else if (val === 'Stock Opname') {
      setKeterangan('1. Telah dilakukan penghitungan fisik pada Gudang Utama.\n2. Ditemukan selisih pada barang [NAMA BARANG] sebesar [JUMLAH].\n3. Alasan selisih: [ALASAN]');
      setPasal('Merujuk pada Peraturan Keuangan Yayasan, segala bentuk selisih stok (kurang/lebih) harus disesuaikan pada sistem setelah disetujui Direktur.');
    } else if (val === 'Pemusnahan Dokumen / Barang') {
      setKeterangan('1. Telah dilakukan pemusnahan barang/dokumen berupa: [DAFTAR BARANG]\n2. Metode pemusnahan: [DIBAKAR / DIHANCURKAN]\n3. Saksi pemusnahan: [NAMA SAKSI]');
      setPasal('Sesuai dengan Undang-Undang Kearsipan / Kebijakan RS, dokumen yang telah melewati masa retensi 5 tahun berhak dimusnahkan secara legal.');
    } else if (val === 'Laporan Bulanan') {
      setKeterangan('1. Rekapitulasi mutasi barang (Masuk dan Keluar) selama periode [BULAN].\n2. Ketersediaan stok dalam batas aman.\n3. Rincian lengkap terlampir.');
      setPasal('Laporan ini disusun sebagai bentuk pertanggungjawaban bulanan kepada pihak Yayasan dan Direktur sesuai tata tertib administrasi Logistik.');
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-300">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; }
          .print\\:w-full { width: 100% !important; }
        }
      `}</style>

      {/* Editor Form - Hidden on Print */}
      <div className={`w-full xl:w-[400px] shrink-0 print:hidden space-y-4 ${previewParams ? 'hidden' : ''}`}>
        <Card className="p-4">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800"><Edit className="text-teal-600" size={18} /> Editor Berita Acara</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenis Berita Acara</label>
              <select value={jenisBA} onChange={handleJenisChange} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded">
                <option value="Kerusakan / Kehilangan">Laporan Kerusakan / Kehilangan</option>
                <option value="Serah Terima Barang">Serah Terima Barang</option>
                <option value="Stock Opname">Penyesuaian Stock Opname</option>
                <option value="Pemusnahan Dokumen / Barang">Pemusnahan Dokumen / Barang</option>
                <option value="Laporan Bulanan">Laporan Bulanan</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor Surat</label>
              <input type="text" value={noBA} onChange={e => setNoBA(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <h3 className="text-[10px] font-bold text-slate-700 uppercase mb-2">Pihak Pertama</h3>
              <input type="text" value={pihak1Nama} onChange={e => setPihak1Nama(e.target.value)} placeholder="Nama" className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded mb-2" />
              <input type="text" value={pihak1Jabatan} onChange={e => setPihak1Jabatan(e.target.value)} placeholder="Jabatan" className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <h3 className="text-[10px] font-bold text-slate-700 uppercase mb-2">Pihak Kedua</h3>
              <input type="text" value={pihak2Nama} onChange={e => setPihak2Nama(e.target.value)} placeholder="Nama" className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded mb-2" />
              <input type="text" value={pihak2Jabatan} onChange={e => setPihak2Jabatan(e.target.value)} placeholder="Jabatan" className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Detail Rincian / Keterangan</label>
              <textarea 
                value={keterangan} 
                onChange={e => setKeterangan(e.target.value)} 
                rows={4}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pasal / Hak Hukum (Penutup)</label>
              <textarea 
                value={pasal} 
                onChange={e => setPasal(e.target.value)} 
                rows={3}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded resize-none"
              ></textarea>
            </div>

            <Button onClick={printReport} icon={Printer} className="w-full bg-teal-600 hover:bg-teal-700 h-9">
              Cetak Berita Acara
            </Button>
          </div>
        </Card>
      </div>

      {/* Document Preview */}
      <div className="flex-1 overflow-x-auto print:overflow-visible">
        <Card className="p-8 bg-white min-h-[297mm] shadow-sm max-w-[210mm] mx-auto border border-slate-200 print:border-none print:shadow-none print:w-full print:max-w-none print:p-0">
          <KopSurat settings={settings} />

          <div className="text-center mb-8 mt-2">
            <h2 className="text-lg font-bold underline uppercase">BERITA ACARA {jenisBA.toUpperCase()}</h2>
            <p className="mt-1 text-xs font-bold">Nomor: {noBA}</p>
          </div>

          <div className="text-justify space-y-4 text-[13px] leading-relaxed">
            <p>Pada hari ini <strong>{hari}</strong>, tanggal <strong>{tgl}</strong> bulan <strong>{bln}</strong> tahun <strong>{thn}</strong>, bertempat di {settings.namaInstansi}, kami yang bertanda tangan di bawah ini:</p>
            
            <table className="ml-4 my-4 border-none text-[13px]">
              <tbody>
                <tr><td className="w-6 align-top py-0.5">1.</td><td className="w-24 align-top py-0.5">Nama</td><td className="w-4 align-top py-0.5">:</td><td className="align-top py-0.5 font-bold uppercase">{pihak1Nama}</td></tr>
                <tr><td className="align-top py-0.5"></td><td className="align-top py-0.5">Jabatan</td><td className="align-top py-0.5">:</td><td className="align-top py-0.5">{pihak1Jabatan}</td></tr>
              </tbody>
            </table>
            <p>Selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.</p>

            <table className="ml-4 my-4 border-none text-[13px]">
              <tbody>
                <tr><td className="w-6 align-top py-0.5">2.</td><td className="w-24 align-top py-0.5">Nama</td><td className="w-4 align-top py-0.5">:</td><td className="align-top py-0.5 font-bold uppercase">{pihak2Nama}</td></tr>
                <tr><td className="align-top py-0.5"></td><td className="align-top py-0.5">Jabatan</td><td className="align-top py-0.5">:</td><td className="align-top py-0.5">{pihak2Jabatan}</td></tr>
              </tbody>
            </table>
            <p>Selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.</p>

            <p className="mt-6">Telah sepakat untuk membuat Berita Acara {jenisBA} dengan rincian sebagai berikut:</p>
            
            <div className="min-h-[150px] w-full mt-4 p-4 border border-slate-300 rounded bg-slate-50">
              <p className="whitespace-pre-wrap font-mono text-xs mb-4">{keterangan}</p>
              {pasal && (
                <div className="pt-4 border-t border-slate-300">
                  <h4 className="font-bold text-[10px] uppercase mb-1">Landasan / Ketentuan:</h4>
                  <p className="whitespace-pre-wrap font-mono text-[11px] italic">{pasal}</p>
                </div>
              )}
            </div>

            <p className="mt-6">Demikian Berita Acara ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.</p>
          </div>

          <div className="mt-16 flex justify-between px-10">
            {renderSignature("PIHAK PERTAMA,", pihak1Nama, pihak1Jabatan, pihak1Nama === settings.namaAdmin && settings.useQRAdmin)}
            {renderSignature("PIHAK KEDUA,", pihak2Nama, pihak2Jabatan, pihak2Nama === settings.namaKepala && settings.useQRSarpras)}
          </div>
        </Card>
      </div>
    </div>
  );
}
