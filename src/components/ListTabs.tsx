import React from 'react';
import { ShoppingList } from '../types';
import { Plus, Users, Calendar } from 'lucide-react';
import { sound } from '../utils/audio';

interface ListTabsProps {
  lists: ShoppingList[];
  activeListId: string;
  onSelectList: (id: string) => void;
  onOpenNewListModal: () => void;
}

export const ListTabs: React.FC<ListTabsProps> = ({
  lists,
  activeListId,
  onSelectList,
  onOpenNewListModal,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
      <div className="flex p-1 bg-slate-900/90 rounded-2xl border border-white/10 backdrop-blur-xl shadow-glass-sm max-w-full">
        {lists.map((list) => {
          const isActive = list.id === activeListId;
          return (
            <button
              key={list.id}
              type="button"
              onClick={() => {
                sound.playStep();
                onSelectList(list.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{list.emoji}</span>
              <span>{list.title}</span>
              {list.type === 'temporary' && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                  Evento
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Button to create temporary/new list */}
      <button
        type="button"
        onClick={() => {
          sound.playStep();
          onOpenNewListModal();
        }}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 backdrop-blur-lg whitespace-nowrap transition-all active:scale-95 shadow-glass-sm"
      >
        <Plus className="w-3.5 h-3.5 text-blue-400" />
        <span>Nova Lista</span>
      </button>
    </div>
  );
};
