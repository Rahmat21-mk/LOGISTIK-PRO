import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { PrintHistory, Product, BarangMasuk, BarangKeluar, AppSettings, User, LaporanComment, AppNotification } from '../types';
import { Printer, Eye, X, History } from 'lucide-react';
import LaporanView from './LaporanView';
import BeritaAcaraView from './BeritaAcaraView';

export default function RiwayatCetakView({ 
  history,
  products,
  historyMasuk,
  historyKeluar,
  settings,
  comments,
  setComments,
  currentUser,
  notifications,
  setNotifications
}: { 
  history: PrintHistory[],
  products: Product[],
  historyMasuk: BarangMasuk[],
  historyKeluar: BarangKeluar[],
  settings: AppSettings,
  comments: LaporanComment[],
  setComments: (c: LaporanComment[]) => void,
  currentUser: User,
  notifications: AppNotification[],
  setNotifications: (n: AppNotification[]) => void
}) {
  const [selectedPreview, setSelectedPreview] = useState<PrintHistory | null>(null);

  if (selectedPreview) {
    return (
      <div className="relative">
        <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm print:hidden">
          <div>
            <h2 className="font-bold text-lg text-slate-800">Preview Dokumen: {selectedPreview.documentNo}</h2>
            <p className="text-xs text-slate-500">Dicetak oleh {selectedPreview.printedBy} pada {new Date(selectedPreview.datePrinted).toLocaleString()}</p>
          </div>
          <Button onClick={() => setSelectedPreview(null)} variant="secondary" icon={X}>Tutup Preview</Button>
        </div>
        
        {/* Render the actual view but we need to pass initialParams. 
            Since we don't want to modify LaporanView/BeritaAcaraView too much, 
            we can wrap them and pass a special previewParams prop, 
            which we will add to them. */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden pointer-events-none">
          <div className="pointer-events-auto">
            {selectedPreview.type === 'Laporan' ? (
              <LaporanView 
                products={products}
                historyMasuk={historyMasuk}
                historyKeluar={historyKeluar}
                settings={settings}
                comments={comments}
                setComments={setComments}
                currentUser={currentUser}
                notifications={notifications}
                setNotifications={setNotifications}
                previewParams={selectedPreview.params}
              />
            ) : (
              <BeritaAcaraView 
                settings={settings}
                previewParams={selectedPreview.params}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><History className="text-teal-600" /> Riwayat Cetak Dokumen</h2>
          <p className="text-sm text-slate-500">Log semua dokumen yang telah dicetak atau diunduh</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr className="text-xs text-slate-500">
                <th className="px-4 py-3 uppercase font-bold">Tanggal Cetak</th>
                <th className="px-4 py-3 uppercase font-bold">Tipe Dokumen</th>
                <th className="px-4 py-3 uppercase font-bold">Nomor Surat / Judul</th>
                <th className="px-4 py-3 uppercase font-bold">Dicetak Oleh</th>
                <th className="px-4 py-3 uppercase font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 italic">Belum ada riwayat cetak dokumen.</td>
                </tr>
              ) : (
                history.map(item => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs">{new Date(item.datePrinted).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.type === 'Laporan' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{item.documentNo}</p>
                      <p className="text-[10px] text-slate-500">{item.title}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{item.printedBy}</td>
                    <td className="px-4 py-3 text-right">
                      <Button onClick={() => setSelectedPreview(item)} variant="secondary" icon={Eye} className="text-xs py-1">Lihat Preview</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
