import React, { useState } from 'react';
import { X, LogOut, ShieldCheck, UserPlus, Users, Sun, Moon, Type } from 'lucide-react';
import { ShoppingList, User } from '../types';
import { sound } from '../utils/audio';

export type AppTheme = 'dark' | 'light';
export type AppFontScale = 'normal' | 'large' | 'xlarge';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentList: ShoppingList;
  onLogout: () => void;
  onAddFamilyMember: (name: string, email: string) => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  fontScale: AppFontScale;
  onFontScaleChange: (scale: AppFontScale) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentList,
  onLogout,
  onAddFamilyMember,
  theme,
  onThemeChange,
  fontScale,
  onFontScaleChange,
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  if (!isOpen) return null;

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    sound.playSuccess();
    onAddFamilyMember(newMemberName.trim(), newMemberEmail.trim().toLowerCase());
    setNewMemberName('');
    setNewMemberEmail('');
    setIsAddingMember(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md modal-surface-bg bg-[#0e131f] border border-white/15 rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-pop-in space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-theme-primary text-white truncate">
              Menu & Ajustes
            </h2>
            <p className="text-xs text-theme-secondary text-slate-400 truncate">
              {currentUser.name} ({currentUser.email})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full surface-subtle bg-white/10 flex items-center justify-center text-theme-secondary text-slate-300 flex-shrink-0 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Theme (Dark vs Light Background) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-theme-primary text-slate-200 block">
            Cor do Fundo:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playStep();
                onThemeChange('dark');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'surface-subtle bg-white/[0.05] text-theme-secondary text-slate-300 border-white/10'
              }`}
            >
              <Moon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Escuro</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playStep();
                onThemeChange('light');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'surface-subtle bg-white/[0.05] text-theme-secondary text-slate-300 border-white/10'
              }`}
            >
              <Sun className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Claro</span>
            </button>
          </div>
        </div>

        {/* 2. Font Size Scaling for Accessibility */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-theme-primary text-slate-200 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span>Tamanho da Fonte (Letra):</span>
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => {
                sound.playStep();
                onFontScaleChange('normal');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                fontScale === 'normal'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'surface-subtle bg-white/[0.05] text-theme-secondary text-slate-300 border-white/10'
              }`}
            >
              Normal
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playStep();
                onFontScaleChange('large');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                fontScale === 'large'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'surface-subtle bg-white/[0.05] text-theme-secondary text-slate-300 border-white/10'
              }`}
            >
              Grande
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playStep();
                onFontScaleChange('xlarge');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                fontScale === 'xlarge'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'surface-subtle bg-white/[0.05] text-theme-secondary text-slate-300 border-white/10'
              }`}
            >
              Extra
            </button>
          </div>
        </div>

        {/* 3. Family Collaborators in this list */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-theme-primary text-slate-300 flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>Membros ({currentList.collaborators.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingMember(!isAddingMember)}
              className="text-xs text-blue-500 font-bold whitespace-nowrap flex-shrink-0"
            >
              {isAddingMember ? 'Cancelar' : '+ Convidar por e-mail'}
            </button>
          </div>

          {isAddingMember && (
            <form
              onSubmit={handleAddMemberSubmit}
              className="p-3 surface-subtle bg-white/[0.04] rounded-2xl border border-white/10 space-y-2.5 mb-3"
            >
              <div>
                <label className="text-[11px] text-theme-secondary text-slate-400 block mb-1">
                  Nome da pessoa:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nome do cônjuge ou filho"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl composer-pill-bg bg-black/40 border border-white/15 text-theme-primary text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-theme-secondary text-slate-400 block mb-1">
                  E-mail da pessoa:
                </label>
                <input
                  type="email"
                  required
                  placeholder="emaildapessoa@gmail.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl composer-pill-bg bg-black/40 border border-white/15 text-theme-primary text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Autorizar Acesso</span>
              </button>
            </form>
          )}

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {currentList.collaborators.map((collab) => (
              <div
                key={collab.id + collab.email}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl surface-subtle bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-theme-primary text-slate-200 block truncate">
                      {collab.name}{' '}
                      {collab.email.toLowerCase() === currentUser.email.toLowerCase() && '(Você)'}
                    </span>
                    <span className="text-[10px] text-theme-secondary text-slate-400 block truncate">
                      {collab.email}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Logout Action */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Deseja sair da sua conta?')) {
                sound.playStep();
                onLogout();
                onClose();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-500 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/25 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
