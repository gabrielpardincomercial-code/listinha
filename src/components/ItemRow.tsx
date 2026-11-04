import React from 'react';
import { Check, Trash2, Plus, Minus, User as UserIcon, Tag } from 'lucide-react';
import { ListItem, ShoppingList, User } from '../types';
import { CATEGORIES, formatQuantityDisplay } from '../utils/categories';
import { sound } from '../utils/audio';

interface ItemRowProps {
  item: ListItem;
  list: ShoppingList;
  currentUser: User;
  onToggleComplete: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onDelete: (itemId: string) => void;
  onAssignItem: (itemId: string, participant: User | null) => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  list,
  currentUser,
  onToggleComplete,
  onUpdateQuantity,
  onDelete,
  onAssignItem,
}) => {
  const category = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

  const handleToggle = () => {
    if (!item.completed) {
      sound.playCheck();
    } else {
      sound.playUncheck();
    }
    onToggleComplete(item.id);
  };

  const isAssignedToMe = item.assignedTo?.id === currentUser.id;

  return (
    <div
      className={`group relative flex items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl transition-all duration-200 border ${
        item.completed
          ? 'item-row-completed bg-white/[0.02] border-white/5 opacity-65'
          : 'item-row-card bg-white/[0.05] hover:bg-white/[0.08] border-white/10 shadow-glass-sm'
      }`}
    >
      {/* Left: Apple circular checkbox & details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Apple Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0 ${
            item.completed
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-100 animate-check-bounce'
              : 'border-2 border-slate-400/50 hover:border-blue-400 bg-white/5'
          }`}
          aria-label={item.completed ? 'Marcar como não pego' : 'Marcar como pego'}
        >
          {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-sm sm:text-base font-semibold transition-all break-words ${
                item.completed
                  ? 'line-through text-slate-400'
                  : 'text-theme-primary text-white'
              }`}
            >
              {item.name}
            </span>

            {/* Quantity Pill */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold tabular-nums whitespace-nowrap flex-shrink-0 ${
                item.completed
                  ? 'bg-white/5 text-slate-400'
                  : 'bg-blue-500/15 text-blue-500 border border-blue-500/25'
              }`}
            >
              {formatQuantityDisplay(item)}
            </span>
          </div>

          {/* Subtitle meta: Category & Assignment / Checked By */}
          <div className="flex items-center gap-2 mt-0.5 text-xs text-theme-secondary text-slate-400 flex-wrap">
            {/* Category tag */}
            <span className="inline-flex items-center gap-1 text-[11px] text-theme-secondary text-slate-400 whitespace-nowrap">
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </span>

            {/* Completed by info */}
            {item.completed && item.completedBy && (
              <span className="text-[11px] text-emerald-400 font-medium">
                • Pego por {item.completedBy.name.split(' ')[0]}
              </span>
            )}

            {/* Temporary / Happy Hour: Person Assignment */}
            {list.type === 'temporary' && !item.completed && (
              <div className="flex items-center gap-1">
                <span className="text-slate-500">•</span>
                {item.assignedTo ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      isAssignedToMe
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <UserIcon className="w-2.5 h-2.5" />
                    <span>{item.assignedTo.name.split(' ')[0]} leva</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAssignItem(item.id, currentUser)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
                  >
                    + Eu levo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick In-Row Stepper (+ / -) & Delete */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {!item.completed && (
          <div className="flex items-center surface-subtle bg-black/40 rounded-xl border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, -1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-theme-secondary text-slate-400 hover:text-blue-500 active:scale-95 transition-all"
              title="Diminuir quantidade"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-theme-secondary text-slate-400 hover:text-blue-500 active:scale-95 transition-all"
              title="Aumentar quantidade"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Delete button */}
        <button
          type="button"
          onClick={() => {
            sound.playStep();
            onDelete(item.id);
          }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all"
          title="Remover item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
