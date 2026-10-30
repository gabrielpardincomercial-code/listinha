import React, { useState } from 'react';
import { X, LogOut, ShieldCheck, UserPlus, Users, Mail } from 'lucide-react';
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
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    sound.playSuccess();
    onAddFamilyMember(newMemberName.trim(), newMemberEmail.trim().toLowerCase());
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
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500"
            />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Sua Conta & Membros</h2>
              <p className="text-xs text-slate-400">Gerenciar acesso à lista</p>
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
                Conectado e Sincronizado
              </span>
            </div>
          </div>
        </div>

        {/* Family Collaborators in this list */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Membros desta lista ({currentList.collaborators.length}):
            </span>
            <button
              type="button"
              onClick={() => setIsAddingMember(!isAddingMember)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              {isAddingMember ? 'Cancelar' : '+ Adicionar membro por e-mail'}
            </button>
          </div>

          {isAddingMember && (
            <form
              onSubmit={handleAddMemberSubmit}
              className="p-3.5 bg-white/[0.04] rounded-2xl border border-white/10 space-y-3 mb-3 animate-fade-in"
            >
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Ao adicionar o e-mail de outra pessoa aqui, assim que ela entrar no app com esse mesmo e-mail, <strong>esta lista aparecerá automaticamente para ela</strong>:
              </p>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Nome da pessoa:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Nome do cônjuge, filho ou amigo"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  E-mail da pessoa (obrigatório para vincular):
                </label>
                <input
                  type="email"
                  required
                  placeholder="emaildapessoa@gmail.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Autorizar e Compartilhar Lista</span>
              </button>
            </form>
          )}

          <div className="space-y-1.5">
            {currentList.collaborators.map((collab) => (
              <div
                key={collab.id + collab.email}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={collab.avatar}
                    alt={collab.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/15 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-slate-200 block truncate">
                      {collab.name}{' '}
                      {collab.email.toLowerCase() === currentUser.email.toLowerCase() && '(Você)'}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {collab.email}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 flex-shrink-0">
                  {collab.id === currentList.ownerId ? 'Criador' : 'Convidado'}
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
              if (
                window.confirm(
                  'Deseja sair da sua conta? Você voltará para a tela inicial de login.'
                )
              ) {
                sound.playStep();
                onLogout();
                onClose();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-98 text-red-400 font-semibold text-xs flex items-center justify-center gap-2 border border-red-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Conta (Trocar Usuário)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
