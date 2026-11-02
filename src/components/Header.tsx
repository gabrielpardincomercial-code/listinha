import React from 'react';
import { Share2, Radio } from 'lucide-react';
import { ShoppingList, SyncStatus, User } from '../types';

interface HeaderProps {
  currentList: ShoppingList;
  currentUser: User;
  syncStatus: SyncStatus;
  onOpenShare: () => void;
  onOpenAuth: () => void;
  onOpenNewList: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentList,
  currentUser,
  onOpenShare,
  onOpenAuth,
}) => {
  return (
    <header
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
      className="w-full flex-shrink-0 z-30 apple-blur-nav transition-all"
    >
      <div className="max-w-3xl mx-auto px-3.5 h-14 flex items-center justify-between gap-2">
        {/* Brand & Active List */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <span className="text-lg">🛒</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#090b10] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                Listinha
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20 flex-shrink-0 whitespace-nowrap">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <span>{currentList.emoji}</span>
              <span className="font-medium text-slate-300 truncate">{currentList.title}</span>
              {currentList.collaborators.length > 1 && (
                <span className="text-[10px] text-slate-500 font-normal flex-shrink-0">
                  • {currentList.collaborators.length}p
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right side controls: Share & Profile */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-all shadow-sm whitespace-nowrap"
            title="Compartilhar lista"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            className="relative flex items-center gap-1.5 p-1 pr-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/10 transition-all"
            title={`Conectado como ${currentUser.name}`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20 flex-shrink-0"
            />
            <span className="text-xs font-medium text-slate-200 max-w-[70px] sm:max-w-[110px] truncate">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
