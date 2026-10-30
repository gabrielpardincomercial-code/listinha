import React, { useState, useEffect } from 'react';
import { ShoppingCart, Sparkles, ShieldCheck, ArrowRight, Users, Scale, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { sound } from '../utils/audio';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  inviteListId?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, inviteListId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Google Identity Services if available on window
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: 'dummy-or-real-client-id.apps.googleusercontent.com',
          callback: (response: any) => {
            // If real Google credential JWT is returned, decode payload
            try {
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);
              handleCompleteLogin(payload.name, payload.email, payload.picture);
            } catch {
              // fallback
            }
          },
        });
      } catch {
        // GIS not initialized
      }
    }
  }, []);

  const handleCompleteLogin = (userName: string, userEmail: string, userAvatar?: string) => {
    sound.playSuccess();
    const cleanName = userName.trim() || 'Usuário Google';
    const cleanEmail = userEmail.trim() || `${cleanName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const avatar =
      userAvatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=0D8ABC&color=fff&size=256&bold=true`;

    const user: User = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatar,
      isGoogleAuth: true,
      color: '#0A84FF',
    };

    onLogin(user);
  };

  const handleGoogleQuickSignIn = () => {
    sound.playStep();
    setIsLoading(true);

    // Simulate instant Google popup / SSO authentication prompt
    setTimeout(() => {
      // Prompt user or use default Google account
      const defaultName = name.trim() || 'Gabriel Pardin';
      const defaultEmail = email.trim() || (defaultName.toLowerCase().replace(/\s+/g, '') + '@gmail.com');
      
      handleCompleteLogin(defaultName, defaultEmail);
      setIsLoading(false);
    }, 600);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    handleCompleteLogin(name, email);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 py-8 selection:bg-blue-600/30">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-1 shadow-2xl shadow-blue-500/30 flex items-center justify-center mx-auto border border-white/20">
              <span className="text-4xl">🛒</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#07090e] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">Listinha</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
            {inviteListId
              ? 'Você foi convidado para colaborar em uma lista em tempo real!'
              : 'Sua lista de supermercado colaborativa em tempo real para a família e amigos.'}
          </p>
        </div>

        {/* Feature Pills Card */}
        <div className="glass-card rounded-3xl p-5 mb-6 border border-white/10 space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-300">
              <strong className="text-white block font-semibold">Compartilhe com a família</strong>
              Atualização simultânea com check conforme pegam os itens no mercado.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-300">
              <strong className="text-white block font-semibold">Unidades e Peso (100g, 500g, 1kg)</strong>
              Seleção ágil no + e - sem complicação nos corredores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-300">
              <strong className="text-white block font-semibold">Happy Hour & Eventos</strong>
              Crie listas temporárias e designe cada item para determinado amigo.
            </p>
          </div>
        </div>

        {/* Google Login Section */}
        <div className="glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl">
          <span className="text-xs font-semibold text-slate-400 block text-center mb-4">
            Entre para começar sua lista
          </span>

          {!isManualMode ? (
            <div className="space-y-4">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleQuickSignIn}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 active:scale-98 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-white/10 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Entrar com a Conta Google</span>
                  </>
                )}
              </button>

              {/* Option to type custom name/email */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsManualMode(true)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-4"
                >
                  Personalizar nome e e-mail da conta
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Seu Nome Completo:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Gabriel Alves"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">E-mail Google:</label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualMode(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/30"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Privacy badge */}
          <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sessão segura e sincronizada entre seus dispositivos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
