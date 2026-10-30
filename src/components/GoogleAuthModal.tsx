import React, { useState } from 'react';
import { X, LogOut, Trash2, ShieldCheck, UserPlus, Check, Users } from 'lucide-react';
import { ShoppingList, User } from '../types';
import { sound } from '../utils/audio';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentList: ShoppingList;
  onLogout: () => void;
  onAddFamilyMember: (name: string, email: string) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentList,
  onLogout,
  onAddFamilyMember,
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  if (!isOpen) return null;

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    sound.playSuccess();
    onAddFamilyMember(newMemberName.trim(), newMemberEmail.trim());
    setNewMemberName('');
    setNewMemberEmail('');
    setIsAddingMember(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0e131f] border border-white/15 rounded-3xl p-6 shadow-2xl shadow-black/90 max-h-[90vh] overflow-y-auto animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Sua Conta Google</h2>
              <p className="text-xs text-slate-400">Gerenciar sessão e família</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active User Profile Card */}
        <div className="p-4 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/15 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500 shadow-md flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate">{currentUser.name}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              </div>
              <span className="text-xs text-slate-400 block truncate">{currentUser.email}</span>
              <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                Sessão Google Ativa
              </span>
            </div>
          </div>
        </div>

        {/* Family Collaborators in this list */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Pessoas nesta lista ({currentList.collaborators.length}):
            </span>
            <button
              type="button"
              onClick={() => setIsAddingMember(!isAddingMember)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isAddingMember ? 'Cancelar' : '+ Adicionar pessoa'}
            </button>
          </div>

          {isAddingMember && (
            <form onSubmit={handleAddMemberSubmit} className="p-3 bg-white/[0.04] rounded-2xl border border-white/10 space-y-2.5 mb-3 animate-fade-in">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nome (ex: Esposa, Filho, João):</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Nome do familiar ou amigo"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">E-mail (opcional):</label>
                <input
                  type="email"
                  placeholder="email@gmail.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Salvar Pessoa na Lista</span>
              </button>
            </form>
          )}

          <div className="space-y-1.5">
            {currentList.collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={collab.avatar}
                    alt={collab.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/15"
                  />
                  <span className="text-xs text-slate-200">
                    {collab.name} {collab.id === currentUser.id && '(Você)'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {collab.id === currentList.ownerId ? 'Criador' : 'Membro'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Action */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Deseja realmente sair da conta Google? Você voltará para a tela de login.')) {
                sound.playStep();
                onLogout();
                onClose();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-98 text-red-400 font-semibold text-xs flex items-center justify-center gap-2 border border-red-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Conta (Logout)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
