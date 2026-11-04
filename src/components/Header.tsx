import React from 'react';
import { Share2 } from 'lucide-react';
import { ShoppingList, SyncStatus, User } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentList: ShoppingList;
  currentUser: User;
  syncStatus: SyncStatus;
  onOpenShare: () => void;
  onOpenAuth: () => void;
  onOpenNewList: () => void;
}

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenShare,
  onOpenAuth,
}) => {
  const initials = getUserInitials(currentUser.name);

  return (
    <header
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
      className="w-full flex-shrink-0 z-30 apple-blur-nav transition-all"
    >
      <div className="max-w-3xl mx-auto px-3.5 h-13 py-1.5 flex items-center justify-between gap-2">
        {/* Left: ONLY the Cart Icon with Online Green Dot */}
        <BrandLogo size="sm" showBadge />

        {/* Right: Share Icon Only + User Initials Only */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenShare}
            className="w-9 h-9 rounded-full surface-subtle bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 flex items-center justify-center border border-white/10 transition-all"
            title="Compartilhar lista"
            aria-label="Compartilhar lista"
          >
            <Share2 className="w-4 h-4 text-blue-500" />
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center shadow-sm border border-white/20 transition-all tracking-tight"
            title={`Menu de ${currentUser.name}`}
            aria-label="Abrir menu da conta e aparência"
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  );
};
