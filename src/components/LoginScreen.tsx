import React, { useState } from 'react';
import { ShoppingCart, Sparkles, ShieldCheck, ArrowRight, Users, Scale, Check, ChevronRight, UserPlus, Info } from 'lucide-react';
import { User } from '../types';
import { sound } from '../utils/audio';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  inviteListId?: string | null;
}

interface SavedGoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

const PRESET_ACCOUNTS: SavedGoogleAccount[] = [
  {
    name: 'Gabriel Alves Pardin',
    email: 'gabrielalvespardin@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Gabriel+Alves&background=0A84FF&color=fff&size=256&bold=true',
  },
  {
    name: 'Camila Pardin',
    email: 'camila.pardin@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Camila+Pardin&background=FF2D55&color=fff&size=256&bold=true',
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, inviteListId }) => {
  // Modal flow state: 'home' | 'choose_account' | 'custom_account' | 'consent'
  const [flowStep, setFlowStep] = useState<'home' | 'choose_account' | 'custom_account' | 'consent'>('home');
  const [selectedAccount, setSelectedAccount] = useState<SavedGoogleAccount | null>(null);

  // Custom Google Account form
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  // Handle choosing one of the preset accounts
  const handleSelectAccount = (acc: SavedGoogleAccount) => {
    sound.playStep();
    setSelectedAccount(acc);
    setFlowStep('consent'); // Advance to consent/acceptance screen!
  };

  // Handle submitting custom account
  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    sound.playStep();
    const acc: SavedGoogleAccount = {
      name: customName.trim(),
      email: customEmail.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName.trim())}&background=0D8ABC&color=fff&size=256&bold=true`,
    };

    setSelectedAccount(acc);
    setFlowStep('consent'); // Advance to consent/acceptance screen!
  };

  // Handle final Consent acceptance
  const handleAcceptAndContinue = () => {
    if (!selectedAccount) return;
    sound.playSuccess();

    const user: User = {
      id: `usr_${selectedAccount.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: selectedAccount.name,
      email: selectedAccount.email,
      avatar: selectedAccount.avatar,
      isGoogleAuth: true,
      color: '#0A84FF',
    };

    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 py-8 selection:bg-blue-600/30">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Main Welcome View */}
        {flowStep === 'home' && (
          <>
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
                  ? 'Você foi convidado para colaborar em uma lista compartilhada em tempo real!'
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
                  <strong className="text-white block font-semibold">Compartilhe com o cônjuge e família</strong>
                  Sincronização ao vivo com check conforme pegam os itens no mercado.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-white block font-semibold">Unidades e Peso (100g, 500g, 1kg)</strong>
                  Seleção rápida no + e - sem perder tempo nos corredores.
                </p>
              </div>
            </div>

            {/* Google Sign In Trigger */}
            <div className="glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl text-center">
              <span className="text-xs font-semibold text-slate-400 block mb-4">
                Entre com sua conta Google para continuar
              </span>

              <button
                type="button"
                onClick={() => {
                  sound.playStep();
                  setFlowStep('choose_account');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 active:scale-98 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-white/10"
              >
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
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Escolha sua conta e confirme as permissões</span>
              </div>
            </div>
          </>
        )}

        {/* STEP 1: Google Account Chooser ("Escolha uma conta") */}
        {flowStep === 'choose_account' && (
          <div className="bg-[#10141f] border border-white/20 rounded-3xl p-6 shadow-2xl animate-pop-in">
            {/* Google Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-5">
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
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
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Fazer login com o Google</h2>
                <p className="text-xs text-slate-400">Escolha uma conta para continuar no Listinha</p>
              </div>
            </div>

            {/* List of Accounts */}
            <div className="space-y-2.5 mb-5">
              {PRESET_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:scale-98 border border-white/10 text-left transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-white block truncate group-hover:text-blue-400 transition-colors">
                        {acc.name}
                      </span>
                      <span className="text-xs text-slate-400 block truncate">{acc.email}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              ))}

              {/* Option to Use Another Account */}
              <button
                type="button"
                onClick={() => {
                  sound.playStep();
                  setFlowStep('custom_account');
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] active:scale-98 border border-dashed border-white/20 text-left transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-slate-300 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">Usar outra conta do Google</span>
                  <span className="text-xs text-slate-400 block">Digitar outro nome e e-mail</span>
                </div>
              </button>
            </div>

            {/* Cancel Button */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setFlowStep('home')}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-white font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* STEP 1.B: Type Custom Google Account */}
        {flowStep === 'custom_account' && (
          <div className="bg-[#10141f] border border-white/20 rounded-3xl p-6 shadow-2xl animate-pop-in">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-5">
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
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
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Inserir Conta Google</h2>
                <p className="text-xs text-slate-400">Qual conta você quer usar?</p>
              </div>
            </div>

            <form onSubmit={handleCustomAccountSubmit} className="space-y-4 mb-5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Nome do Titular:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Seu Nome ou da Esposa"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">E-mail do Google (Gmail):</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFlowStep('choose_account')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium transition-all"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim() || !customEmail.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/30"
                >
                  <span>Avançar para Consentimento</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Google Consent Screen ("Listinha quer acessar sua conta") */}
        {flowStep === 'consent' && selectedAccount && (
          <div className="bg-[#10141f] border border-white/20 rounded-3xl p-6 shadow-2xl animate-pop-in">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
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
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white tracking-tight">Consentimento do Google</h2>
                <p className="text-xs text-slate-400">Listinha quer acessar sua conta</p>
              </div>
            </div>

            {/* Selected Account Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 mb-4">
              <img
                src={selectedAccount.avatar}
                alt={selectedAccount.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-blue-500"
              />
              <div className="min-w-0">
                <span className="text-sm font-bold text-white block truncate">{selectedAccount.name}</span>
                <span className="text-xs text-slate-400 block truncate">{selectedAccount.email}</span>
              </div>
            </div>

            {/* Requested Permissions */}
            <div className="space-y-3 mb-5">
              <span className="text-xs font-semibold text-slate-300 block">
                O aplicativo <strong className="text-white">Listinha</strong> solicita permissão para:
              </span>

              <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Gerenciar listas de compras compartilhadas:</strong> criar itens, marcar como pego e atualizar em tempo real.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Colaboração com membros:</strong> sincronizar instantaneamente com cônjuge e amigos que receberem o link.
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Identificação do perfil:</strong> exibir seu nome e avatar ao lado dos itens comprados por você.
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ao clicar em <strong>Aceitar e Continuar</strong>, você autoriza o aplicativo a sincronizar suas listas na nuvem. Você pode revogar o acesso a qualquer momento.
              </p>
            </div>

            {/* Action Buttons: Cancel vs Accept */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  sound.playStep();
                  setFlowStep('choose_account');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-semibold text-xs transition-all active:scale-95"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleAcceptAndContinue}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Aceitar e Continuar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
