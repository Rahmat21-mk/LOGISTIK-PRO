import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import { User, AppSettings } from '../types';
import { Settings, Users, Shield, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

export default function PengaturanView({ 
  users, 
  setUsers, 
  settings, 
  setSettings,
  currentUser 
}: { 
  users: User[],
  setUsers: (u: User[]) => void,
  settings: AppSettings,
  setSettings: (s: AppSettings) => void,
  currentUser: User
}) {
  const [newUser, setNewUser] = useState<Partial<User>>({ username: '', name: '', role: 'Petugas Sarpras', password: '' });
  
  const isSuperAdmin = currentUser.role === 'Super Admin';

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("Hanya Super Admin yang dapat menambah akun!");
      return;
    }
    const u: User = {
      id: `u-${Date.now()}`,
      username: newUser.username!,
      name: newUser.name!,
      role: newUser.role as any,
      password: newUser.password!
    };
    setUsers([...users, u]);
    setNewUser({ username: '', name: '', role: 'Petugas Sarpras', password: '' });
    alert("Akun berhasil ditambahkan!");
  };

  const handleDeleteUser = (id: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm("Hapus akun ini?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleResetPassword = (id: string, username: string) => {
    if (!isSuperAdmin) return;
    const newPass = window.prompt(`Masukkan password baru untuk user ${username}:`);
    if (newPass && newPass.trim() !== "") {
      setUsers(users.map(u => u.id === id ? { ...u, password: newPass.trim() } : u));
      alert("Password berhasil diubah!");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
       const base64Full = ev.target?.result as string;
       setSettings({...settings, logoPreview: base64Full});
       alert("Logo berhasil diperbarui dan tersimpan otomatis!");
    };
    reader.readAsDataURL(file);
  };

  const handleLogoKananUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
       const base64Full = ev.target?.result as string;
       setSettings({...settings, logoKananPreview: base64Full});
       alert("Logo Kanan berhasil diperbarui dan tersimpan otomatis!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {isSuperAdmin && (
        <Card className="p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800"><Users className="text-teal-600" size={18} /> Manajemen Akun & Hak Akses (Super Admin)</h2>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <h3 className="font-bold text-xs mb-3 text-slate-700 uppercase">Tambah Akun Baru</h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username</label>
                <input type="text" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="username" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                <input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="Nama Petugas" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role / Hak Akses</label>
                <select required value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded">
                  <option value="Admin Gudang">Admin Gudang</option>
                  <option value="Kepala Sarpras">Kepala Sarpras</option>
                  <option value="Petugas Sarpras">Petugas Sarpras</option>
                  <option value="Yayasan">Yayasan (Pemantau)</option>
                  <option value="HRD">HRD (Pemantau)</option>
                  <option value="Direktur">Direktur (Pemantau)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password</label>
                <input type="text" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="Password" />
              </div>
              <div>
                <Button type="submit" className="w-full" icon={Plus}>Daftarkan Akun</Button>
              </div>
            </form>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                <tr>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[10px]">{u.username}</td>
                    <td className="px-3 py-2 font-bold">{u.name}</td>
                    <td className="px-3 py-2">
                      <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded text-[9px] uppercase font-bold">{u.role}</span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleResetPassword(u.id, u.username)} disabled={u.role === 'Super Admin' && currentUser.id !== u.id} className="text-amber-500 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed" title="Reset Password">
                          <Settings size={14} />
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} disabled={u.role === 'Super Admin'} className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed" title="Hapus Akun">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {isSuperAdmin && (
        <Card className="p-4 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800"><Settings className="text-teal-600" size={18} /> Pengaturan Opsi Dropdown Formulir</h2>
            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-1 rounded font-bold border border-teal-200">Tersimpan Otomatis</span>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-xs mb-3 text-slate-700 uppercase">Daftar Divisi / Unit Tujuan</h3>
            <p className="text-[10px] text-slate-500 mb-3">Opsi divisi / unit ini muncul pada form penyortiran barang dan pengeluaran / distribusi umum.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings.divisiOptions?.map((div, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded text-xs font-bold text-slate-700">
                  {div}
                  {div !== 'Gudang' && (
                    <button onClick={() => {
                      if(window.confirm('Hapus divisi ini?')) setSettings({...settings, divisiOptions: settings.divisiOptions?.filter(d => d !== div)});
                    }} className="text-red-500 hover:bg-red-50 p-0.5 rounded ml-1"><Trash2 size={12} /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input type="text" id="newDivisi" placeholder="Nama Divisi Baru" className="px-2 py-1.5 text-xs border border-slate-200 rounded flex-1 max-w-xs" />
              <Button onClick={() => {
                const input = document.getElementById('newDivisi') as HTMLInputElement;
                const val = input.value.trim();
                if (val && !settings.divisiOptions?.includes(val)) {
                  setSettings({...settings, divisiOptions: [...(settings.divisiOptions || []), val]});
                  input.value = '';
                }
              }} icon={Plus} type="button">Tambah Divisi</Button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-xs mb-3 text-slate-700 uppercase">Daftar Ruangan Penggantian</h3>
            <p className="text-[10px] text-slate-500 mb-3">Opsi ruangan yang akan muncul khusus pada formulir perbaikan / penggantian barang (contoh: lampu).</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings.ruanganOptions?.map((ruangan, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded text-xs font-bold text-slate-700">
                  {ruangan}
                  <button onClick={() => {
                    if(window.confirm('Hapus ruangan ini?')) setSettings({...settings, ruanganOptions: settings.ruanganOptions?.filter(r => r !== ruangan)});
                  }} className="text-red-500 hover:bg-red-50 p-0.5 rounded ml-1"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input type="text" id="newRuangan" placeholder="Nama Ruangan Baru" className="px-2 py-1.5 text-xs border border-slate-200 rounded flex-1 max-w-xs" />
              <Button onClick={() => {
                const input = document.getElementById('newRuangan') as HTMLInputElement;
                const val = input.value.trim();
                if (val && !settings.ruanganOptions?.includes(val)) {
                  setSettings({...settings, ruanganOptions: [...(settings.ruanganOptions || []), val]});
                  input.value = '';
                }
              }} icon={Plus} type="button">Tambah Ruangan</Button>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-xs mb-3 text-slate-700 uppercase">Daftar Shift Kerja</h3>
            <p className="text-[10px] text-slate-500 mb-3">Opsi shift yang muncul di form pengeluaran barang (contoh: Pagi, Siang, Malam).</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings.shiftOptions?.map((shift, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded text-xs font-bold text-slate-700">
                  {shift}
                  <button onClick={() => {
                    if(window.confirm('Hapus shift ini?')) setSettings({...settings, shiftOptions: settings.shiftOptions?.filter(s => s !== shift)});
                  }} className="text-red-500 hover:bg-red-50 p-0.5 rounded ml-1"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input type="text" id="newShift" placeholder="Nama Shift Baru" className="px-2 py-1.5 text-xs border border-slate-200 rounded flex-1 max-w-xs" />
              <Button onClick={() => {
                const input = document.getElementById('newShift') as HTMLInputElement;
                const val = input.value.trim();
                if (val && !settings.shiftOptions?.includes(val)) {
                  setSettings({...settings, shiftOptions: [...(settings.shiftOptions || []), val]});
                  input.value = '';
                }
              }} icon={Plus} type="button">Tambah Shift</Button>
            </div>
          </div>
        </Card>
      )}

      {(isSuperAdmin || currentUser.role === 'Admin Gudang') && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800"><Settings className="text-teal-600" size={18} /> Pengaturan Tanda Tangan & Institusi</h2>
            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-1 rounded font-bold border border-teal-200">Tersimpan Otomatis</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-slate-700 uppercase border-b pb-2">Informasi Kop Surat</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Instansi</label>
                <input type="text" value={settings.namaInstansi} onChange={e => setSettings({...settings, namaInstansi: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Alamat Lengkap</label>
                <textarea rows={2} value={settings.alamatLengkap} onChange={e => setSettings({...settings, alamatLengkap: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded"></textarea>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 p-4 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-center bg-slate-50 relative cursor-pointer hover:bg-slate-100">
                  <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {settings.logoPreview ? (
                    <img src={settings.logoPreview} className="h-12 object-contain mb-2" alt="Logo Kiri" />
                  ) : (
                    <ImageIcon size={20} className="text-slate-400 mb-2" />
                  )}
                  <p className="text-[10px] font-bold text-slate-700">Logo Kiri</p>
                </div>
                <div className="flex-1 p-4 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-center bg-slate-50 relative cursor-pointer hover:bg-slate-100">
                  <input type="file" accept="image/png, image/jpeg" onChange={handleLogoKananUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {settings.logoKananPreview ? (
                    <img src={settings.logoKananPreview} className="h-12 object-contain mb-2" alt="Logo Kanan" />
                  ) : (
                    <ImageIcon size={20} className="text-slate-400 mb-2" />
                  )}
                  <p className="text-[10px] font-bold text-slate-700">Logo Kanan</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kontak WhatsApp</label>
                <input type="text" value={settings.kontakWA || ''} onChange={e => setSettings({...settings, kontakWA: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="Contoh: 0822-8903-4048" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Instagram</label>
                  <input type="text" value={settings.kontakIG || ''} onChange={e => setSettings({...settings, kontakIG: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="rsia_tubaba" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Facebook</label>
                  <input type="text" value={settings.kontakFB || ''} onChange={e => setSettings({...settings, kontakFB: e.target.value})} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded" placeholder="RSIA Ummi..." />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-xs text-slate-700 uppercase border-b pb-2">Penandatangan Laporan (E-Sign)</h3>
              
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Admin Gudang</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={settings.namaAdmin} onChange={e => setSettings({...settings, namaAdmin: e.target.value})} className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded font-bold" />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={settings.useQRAdmin} onChange={e => setSettings({...settings, useQRAdmin: e.target.checked})} />
                  Gunakan QR Code Digital
                </label>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Kepala Sarpras</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={settings.namaKepala || ''} onChange={e => setSettings({...settings, namaKepala: e.target.value})} className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded font-bold" />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={settings.useQRSarpras} onChange={e => setSettings({...settings, useQRSarpras: e.target.checked})} />
                  Gunakan QR Code Digital
                </label>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Direktur</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={settings.namaDirektur} onChange={e => setSettings({...settings, namaDirektur: e.target.value})} className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded font-bold" />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={settings.useQRDirektur} onChange={e => setSettings({...settings, useQRDirektur: e.target.checked})} />
                  Gunakan QR Code Digital
                </label>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Pengawas / Yayasan</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={settings.namaYayasan} onChange={e => setSettings({...settings, namaYayasan: e.target.value})} className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded font-bold" />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={settings.useQRYayasan} onChange={e => setSettings({...settings, useQRYayasan: e.target.checked})} />
                  Gunakan QR Code Digital
                </label>
              </div>

            </div>
          </div>
        </Card>
      )}

      {!isSuperAdmin && currentUser.role !== 'Admin Gudang' && (
        <Card className="p-8 text-center text-slate-500">
          <Shield size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-lg font-bold text-slate-700">Akses Terbatas</h2>
          <p className="text-xs">Anda tidak memiliki izin untuk mengubah pengaturan sistem.</p>
        </Card>
      )}

    </div>
  );
}
