import React from 'react';
import { CheckCheck, Trash2, Filter, UserCheck } from 'lucide-react';
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
  currentUser,
  filterMode,
  onFilterChange,
  onClearCompleted,
}) => {
  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isAllDone = totalItems > 0 && completedItems === totalItems;

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5 mb-4 transition-all">
      {/* Top row: Counter & Clean Completed button */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white tracking-tight tabular-nums">
              {percent}%
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              {completedItems} de {totalItems} {totalItems === 1 ? 'item' : 'itens'} no carrinho
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAllDone
              ? '🎉 Parabéns! Todos os itens da lista foram pegos!'
              : 'Marque com check conforme for colocando os itens no carrinho'}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 border border-red-500/20 text-xs font-medium transition-all"
            title="Remover itens já pegos"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar pegos</span>
          </button>
        )}
      </div>

      {/* iOS Progress bar */}
      <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10 mb-4">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-sm shadow-emerald-500/30"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 font-medium mr-1 flex items-center gap-1 text-[11px]">
          <Filter className="w-3 h-3" /> Filtrar:
        </span>

        <button
          type="button"
          onClick={() => {
            sound.playStep();
            onFilterChange('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
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
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
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
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterMode === 'my_items'
                ? 'bg-purple-600 text-white font-semibold shadow-xs shadow-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 bg-white/[0.04]'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Designados a mim</span>
          </button>
        )}
      </div>
    </div>
  );
};
