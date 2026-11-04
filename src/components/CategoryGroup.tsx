import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Category, ListItem, ShoppingList, User } from '../types';
import { ItemRow } from './ItemRow';
import { sound } from '../utils/audio';

interface CategoryGroupProps {
  category: Category;
  items: ListItem[];
  list: ShoppingList;
  currentUser: User;
  onToggleComplete: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onDelete: (itemId: string) => void;
  onAssignItem: (itemId: string, participant: User | null) => void;
}

export const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  items,
  list,
  currentUser,
  onToggleComplete,
  onUpdateQuantity,
  onDelete,
  onAssignItem,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (items.length === 0) return null;

  const completedCount = items.filter((i) => i.completed).length;
  const isGroupAllDone = completedCount === items.length;

  return (
    <div className="mb-4">
      {/* Category Header */}
      <button
        type="button"
        onClick={() => {
          sound.playStep();
          setIsCollapsed(!isCollapsed);
        }}
        className="w-full flex items-center justify-between py-2 px-1 text-left group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{category.icon}</span>
          <span className="text-sm font-bold text-theme-primary text-slate-200 tracking-tight truncate">
            {category.name}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums border flex-shrink-0 ${
              isGroupAllDone
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                : 'surface-subtle bg-white/10 text-theme-secondary text-slate-400 border-white/10'
            }`}
          >
            {completedCount}/{items.length}
          </span>
        </div>

        <div className="flex items-center text-slate-500 group-hover:text-slate-300 transition-colors">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Items list */}
      {!isCollapsed && (
        <div className="space-y-2 mt-1">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              list={list}
              currentUser={currentUser}
              onToggleComplete={onToggleComplete}
              onUpdateQuantity={onUpdateQuantity}
              onDelete={onDelete}
              onAssignItem={onAssignItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};
