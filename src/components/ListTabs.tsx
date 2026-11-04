import React, { useState } from 'react';
import { ShoppingList } from '../types';
import { Plus, ChevronDown, Check, List, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface ListTabsProps {
  lists: ShoppingList[];
  activeListId: string;
  onSelectList: (id: string) => void;
  onOpenNewListModal: () => void;
}

export function truncateText(text: string, maxChars = 18): string {
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;
  return clean.substring(0, maxChars).trim() + '…';
}

export const ListTabs: React.FC<ListTabsProps> = ({
  lists,
  activeListId,
  onSelectList,
  onOpenNewListModal,
}) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const activeList = lists.find((l) => l.id === activeListId) || lists[0];
  if (!activeList) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-2 py-1">
        {/* Left: Active List (truncated) + Plus (+) button */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => {
              sound.playStep();
              setIsSubmenuOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm shadow-blue-600/25 min-w-0 max-w-[200px] sm:max-w-[260px] transition-all active:scale-95"
            title={activeList.title}
          >
            <span className="flex-shrink-0">{activeList.emoji}</span>
            <span className="truncate">{truncateText(activeList.title, 18)}</span>
          </button>

          {/* Plus (+) Button for New List */}
          <button
            type="button"
            onClick={() => {
              sound.playStep();
              onOpenNewListModal();
            }}
            className="w-9 h-9 rounded-xl surface-subtle bg-white/[0.08] hover:bg-white/[0.14] text-blue-400 hover:text-blue-300 border border-white/10 flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            title="Criar nova lista"
            aria-label="Criar nova lista"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Right: "Ver todas" Submenu Trigger */}
        <button
          type="button"
          onClick={() => {
            sound.playStep();
            setIsSubmenuOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl surface-subtle bg-white/[0.06] hover:bg-white/[0.12] text-theme-secondary text-slate-300 border border-white/10 text-xs font-semibold flex-shrink-0 whitespace-nowrap transition-all active:scale-95"
        >
          <List className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span>Ver listas ({lists.length})</span>
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-75" />
        </button>
      </div>

      {/* Submenu Modal to Choose List (No Horizontal Scrolling) */}
      {isSubmenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setIsSubmenuOpen(false)}
        >
          <div
            className="w-full max-w-sm modal-surface-bg bg-[#101522] border border-white/15 rounded-3xl p-5 shadow-2xl animate-pop-in space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <h3 className="text-sm font-bold text-theme-primary text-white">
                Suas Listas ({lists.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsSubmenuOpen(false)}
                className="w-7 h-7 rounded-full surface-subtle bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-0.5">
              {lists.map((list) => {
                const isSelected = list.id === activeListId;
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => {
                      sound.playStep();
                      onSelectList(list.id);
                      setIsSubmenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 text-theme-primary text-white'
                        : 'surface-subtle bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-theme-secondary text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-lg flex-shrink-0">{list.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block truncate">
                          {truncateText(list.title, 26)}
                        </span>
                        <span className="text-[10px] opacity-75 block truncate">
                          {list.type === 'temporary' ? 'Lista Temporária / Evento' : 'Lista da Família'}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSubmenuOpen(false);
                onOpenNewListModal();
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Criar Nova Lista</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
