import React from 'react';
import { Trash2, Filter, UserCheck } from 'lucide-react';
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
  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isAllDone = totalItems > 0 && completedItems === totalItems;

  return (
    <div className="glass-card rounded-3xl p-3.5 sm:p-4 mb-3 transition-all">
      {/* Top row: Counter & Clean Completed button */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight tabular-nums">
              {percent}%
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
              {completedItems} de {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {isAllDone
              ? '🎉 Todos os itens da lista foram pegos!'
              : 'Toque no círculo do item para marcar como pego'}
          </p>
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 border border-red-500/20 text-xs font-medium transition-all flex-shrink-0 whitespace-nowrap"
            title="Remover itens já pegos"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar pegos</span>
          </button>
        )}
      </div>

      {/* iOS Progress bar */}
      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10 mb-3">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-sm shadow-emerald-500/30"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Filter Chips (never wrap text inside buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
        <span className="text-slate-500 font-medium mr-0.5 flex items-center gap-1 text-[11px] flex-shrink-0 whitespace-nowrap">
          <Filter className="w-3 h-3" /> Filtrar:
        </span>

        <button
          type="button"
          onClick={() => {
            sound.playStep();
            onFilterChange('all');
          }}
          className={`px-2.5 py-1.5 rounded-xl font-medium transition-all flex-shrink-0 whitespace-nowrap ${
            filterMode === 'all'
              ? 'bg-white/20 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 bg-white/[0.04]'
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
          className={`px-2.5 py-1.5 rounded-xl font-medium transition-all flex-shrink-0 whitespace-nowrap ${
            filterMode === 'pending'
              ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 bg-white/[0.04]'
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
          className={`px-2.5 py-1.5 rounded-xl font-medium transition-all flex-shrink-0 whitespace-nowrap ${
            filterMode === 'completed'
              ? 'bg-emerald-600 text-white font-semibold shadow-xs shadow-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 bg-white/[0.04]'
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
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition-all flex-shrink-0 whitespace-nowrap ${
              filterMode === 'my_items'
                ? 'bg-purple-600 text-white font-semibold shadow-xs shadow-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 bg-white/[0.04]'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Meus itens</span>
          </button>
        )}
      </div>
    </div>
  );
};
