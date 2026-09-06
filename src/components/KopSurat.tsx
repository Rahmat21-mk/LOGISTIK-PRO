import React from 'react';
import { AppSettings } from '../types';
import { Instagram, Facebook, Phone } from 'lucide-react';

interface KopSuratProps {
  settings: AppSettings;
}

export default function KopSurat({ settings }: KopSuratProps) {
  return (
    <div className="border-b-[5px] border-black pb-3 mb-6 relative w-full flex">
      {/* Logo Kiri */}
      <div className="w-[120px] shrink-0 flex items-center justify-center pr-4">
        {settings.logoPreview ? (
          <img src={settings.logoPreview} className="w-full max-h-[120px] object-contain" alt="Logo Kiri" />
        ) : (
          <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold border border-slate-300 text-center p-2 rounded-full">LOGO KIRI</div>
        )}
      </div>
      
      {/* Center Content */}
      <div className="flex-1 text-center flex flex-col justify-center">
        <h1 className="text-[26px] leading-tight font-black uppercase whitespace-pre-line text-black font-serif tracking-wide mb-2">
          {settings.namaInstansi}
        </h1>
        
        <div className="border-b-[3px] border-black w-full mb-2"></div>
        
        <p className="text-[14px] font-bold text-black whitespace-pre-line leading-snug mb-3 font-serif">
          {settings.alamatLengkap}
        </p>

        {/* Footer / Kontak */}
        <div className="flex justify-center items-center gap-6 text-[13px] font-bold text-black font-serif">
          {settings.kontakIG && (
            <div className="flex items-center gap-1.5">
              <span className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-md p-0.5">
                <Instagram size={14} />
              </span>
              <span>{settings.kontakIG}</span>
            </div>
          )}
          {settings.kontakFB && (
            <div className="flex items-center gap-1.5">
              <span className="bg-blue-600 text-white rounded-sm p-0.5">
                <Facebook size={14} className="fill-current" />
              </span>
              <span>{settings.kontakFB}</span>
            </div>
          )}
          {settings.kontakWA && (
            <div className="flex items-center gap-1.5">
              <span className="bg-green-500 text-white rounded-full p-0.5">
                <Phone size={14} className="fill-current" />
              </span>
              <span>{settings.kontakWA}</span>
            </div>
          )}
        </div>
      </div>

      {/* Logo Kanan */}
      <div className="w-[120px] shrink-0 flex items-center justify-center pl-4">
        {settings.logoKananPreview ? (
          <img src={settings.logoKananPreview} className="w-full max-h-[120px] object-contain" alt="Logo Kanan" />
        ) : (
          <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold border border-slate-300 text-center p-2 rounded-full">LOGO KANAN</div>
        )}
      </div>
    </div>
  );
}
