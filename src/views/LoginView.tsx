import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export default function LoginView({ 
  users, 
  onLogin 
}: { 
  users: User[], 
  onLogin: (u: User) => void 
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check PIN special for Super Admin explicitly as requested
    if (password === 'Gudang1341Rh' || password === '134155') {
      const superAdmin = users.find(u => u.role === 'Super Admin') || {
        id: 'u1', username: 'superadmin', name: 'Super Admin', role: 'Super Admin'
      };
      onLogin(superAdmin as User);
      return;
    }

    const user = users.find(a => a.username === username && a.password === password);
    if (user) {
      setErrorMsg('');
      onLogin(user);
    } else {
      setErrorMsg('Akses Ditolak: Username atau Password salah.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-4">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500 text-white mb-4 shadow-lg shadow-teal-500/40">
            <Lock size={32} />
          </div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase drop-shadow-md">LOGISTIK PRO</h1>
          <p className="text-teal-200 text-[10px] mt-1 font-bold uppercase tracking-widest">RSIA UMMI ATHAYYA</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-100 font-bold">{errorMsg}</p>
          </div>
        )}

        {showForgot ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-teal-900/50 border border-teal-500/30 rounded-lg text-teal-100 text-xs leading-relaxed">
              <p className="font-bold mb-2 text-teal-300">Lupa Sandi / Password?</p>
              <p>Silakan hubungi <strong>Super Admin / IT Support</strong> untuk melakukan reset password akun Anda.</p>
              <p className="mt-2 text-[10px] opacity-70">Akses darurat menggunakan PIN Super Admin tersedia bagi yang memiliki otoritas.</p>
            </div>
            <button type="button" onClick={() => setShowForgot(false)} className="text-xs text-teal-400 hover:text-teal-300 font-bold underline">
              Kembali ke Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-teal-100 text-[10px] font-bold uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-300" size={14} />
                <input 
                  type="text" required value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white/10 border border-white/20 rounded text-white placeholder-teal-200/50 focus:ring-1 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
                  placeholder="Masukkan username"
                />
              </div>
            </div>
            <div>
              <label className="block text-teal-100 text-[10px] font-bold uppercase tracking-wider mb-2">Password / PIN</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-300" size={14} />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white/10 border border-white/20 rounded text-white placeholder-teal-200/50 focus:ring-1 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] text-teal-300 hover:text-white font-bold transition-colors">
                Lupa Sandi?
              </button>
            </div>
            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded text-xs shadow-lg hover:shadow-teal-500/50 transition-all uppercase tracking-wider">
              MASUK SISTEM
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
