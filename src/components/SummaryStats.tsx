import React from 'react';
import { Trash2, UserCheck } from 'lucide-react';
import { ShoppingList, User } from '../types';
import { sound } from '../utils/audio';

interface SummaryStatsProps {
  list: ShoppingList;
  totalItems: number;
  completedItems: number;
  currentUser: User;
  filterMode: 'all' | 'pending' | 'completed' | 'my_items';
  onFilterChange: (mode: 'all' | 'pending' | 'completed' | 'my_items') => void;
  onClearCompleted: () => void;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  list,
  totalItems,
  completedItems,
  filterMode,
  onFilterChange,
  onClearCompleted,
}) => {
  return (
    <div className="flex items-center justify-between gap-1.5 mb-2.5 overflow-x-auto scrollbar-none py-0.5">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => {
            sound.playStep();
            onFilterChange('all');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap ${
            filterMode === 'all'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'surface-subtle bg-white/[0.06] text-theme-secondary text-slate-300'
          }`}
        >
          Todos ({totalItems})
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playStep();
            onFilterChange('pending');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap ${
            filterMode === 'pending'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'surface-subtle bg-white/[0.06] text-theme-secondary text-slate-300'
          }`}
        >
          Pendentes ({totalItems - completedItems})
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playStep();
            onFilterChange('completed');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap ${
            filterMode === 'completed'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'surface-subtle bg-white/[0.06] text-theme-secondary text-slate-300'
          }`}
        >
          Pegos ({completedItems})
        </button>

        {list.type === 'temporary' && (
          <button
            type="button"
            onClick={() => {
              sound.playStep();
              onFilterChange('my_items');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap ${
              filterMode === 'my_items'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'surface-subtle bg-white/[0.06] text-theme-secondary text-slate-300'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Meus</span>
          </button>
        )}
      </div>

      {completedItems > 0 && (
        <button
          type="button"
          onClick={() => {
            sound.playStep();
            if (window.confirm('Deseja limpar todos os itens já pegos da lista?')) {
              onClearCompleted();
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 active:scale-95 text-red-400 border border-red-500/25 text-xs font-semibold transition-all flex-shrink-0 whitespace-nowrap"
          title="Remover itens já pegos"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar pegos</span>
        </button>
      )}
    </div>
  );
};
