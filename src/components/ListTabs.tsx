import React, { useState } from 'react';
import { ShoppingList } from '../types';
import { Plus, Trash2, AlertTriangle, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface ListTabsProps {
  lists: ShoppingList[];
  activeListId: string;
  onSelectList: (id: string) => void;
  onOpenNewListModal: () => void;
  onDeleteList: (id: string) => void;
}

export const ListTabs: React.FC<ListTabsProps> = ({
  lists,
  activeListId,
  onSelectList,
  onOpenNewListModal,
  onDeleteList,
}) => {
  const [confirmDeleteList, setConfirmDeleteList] = useState<ShoppingList | null>(null);

  const activeList = lists.find((l) => l.id === activeListId) || lists[0];

  return (
    <>
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
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
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/10 backdrop-blur-lg whitespace-nowrap transition-all active:scale-95 shadow-glass-sm flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Nova Lista</span>
          </button>
        </div>

        {/* Button to delete active list */}
        {activeList && (
          <button
            type="button"
            onClick={() => {
              sound.playStep();
              setConfirmDeleteList(activeList);
            }}
            title={`Excluir lista "${activeList.title}"`}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 whitespace-nowrap transition-all active:scale-95 flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Excluir Lista</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal to Delete List */}
      {confirmDeleteList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setConfirmDeleteList(null)}
        >
          <div
            className="w-full max-w-sm bg-[#101522] border border-white/15 rounded-3xl p-6 shadow-2xl animate-pop-in space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Excluir Lista?</h3>
                  <p className="text-[11px] text-slate-400">Esta ação removerá a lista e seus itens</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteList(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
              <span className="text-2xl">{confirmDeleteList.emoji}</span>
              <div className="min-w-0">
                <span className="text-sm font-bold text-white block truncate">
                  {confirmDeleteList.title}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {confirmDeleteList.type === 'temporary' ? 'Lista Temporária / Evento' : 'Lista da Família'}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteList(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playStep();
                  onDeleteList(confirmDeleteList.id);
                  setConfirmDeleteList(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
