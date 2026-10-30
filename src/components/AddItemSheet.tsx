import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Check } from 'lucide-react';
import { ListItem, QuantityType, ShoppingList, User, WeightPreset } from '../types';
import { CATEGORIES, detectSmartCategory } from '../utils/categories';
import { QuantitySelector } from './QuantitySelector';
import { sound } from '../utils/audio';

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (itemData: Omit<ListItem, 'id' | 'createdAt' | 'completed' | 'listId'>) => void;
  currentList: ShoppingList;
  currentUser: User;
}

export const AddItemSheet: React.FC<AddItemSheetProps> = ({
  isOpen,
  onClose,
  onAddItem,
  currentList,
  currentUser,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('mercearia');
  const [quantityType, setQuantityType] = useState<QuantityType>('unit');
  const [quantity, setQuantity] = useState<number>(1);
  const [weightPreset, setWeightPreset] = useState<WeightPreset>('100g');
  const [unitLabel, setUnitLabel] = useState('un');
  const [customQuantity, setCustomQuantity] = useState('');
  const [assignedTo, setAssignedTo] = useState<User | undefined>(undefined);
  const [autoDetected, setAutoDetected] = useState(false);

  // Auto-detect category & quantity defaults as user types
  useEffect(() => {
    if (name.trim().length >= 3) {
      const smart = detectSmartCategory(name);
      setCategory(smart.category);
      setQuantityType(smart.quantityType);
      setQuantity(smart.defaultQuantity);
      if (smart.weightPreset) {
        setWeightPreset(smart.weightPreset);
      }
      setUnitLabel(smart.unitLabel);
      setAutoDetected(true);
    }
  }, [name]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sound.playStep();

    onAddItem({
      name: name.trim(),
      category,
      quantityType,
      quantity,
      weightPreset,
      unitLabel,
      customQuantity: customQuantity.trim() || undefined,
      createdBy: { id: currentUser.id, name: currentUser.name },
      assignedTo: assignedTo
        ? { id: assignedTo.id, name: assignedTo.name, avatar: assignedTo.avatar, color: assignedTo.color }
        : undefined,
    });

    // Reset fields
    setName('');
    setCategory('mercearia');
    setQuantityType('unit');
    setQuantity(1);
    setWeightPreset('100g');
    setUnitLabel('un');
    setCustomQuantity('');
    setAssignedTo(undefined);
    setAutoDetected(false);
    onClose();
  };

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#0e131f] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/80 max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-lg font-bold text-white tracking-tight">Adicionar à Lista</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              O que você precisa comprar?
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Ex: Banana, Leite, Picanha, Cerveja..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium transition-all"
              />
              {autoDetected && (
                <div className="absolute right-3 top-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-detectado</span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity Selector Component */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Quantidade & Medida
            </label>
            <QuantitySelector
              quantityType={quantityType}
              quantity={quantity}
              weightPreset={weightPreset}
              unitLabel={unitLabel}
              customQuantity={customQuantity}
              onChange={(data) => {
                setQuantityType(data.quantityType);
                setQuantity(data.quantity);
                if (data.weightPreset) setWeightPreset(data.weightPreset);
                setUnitLabel(data.unitLabel);
                if (data.customQuantity !== undefined) setCustomQuantity(data.customQuantity);
              }}
            />
          </div>

          {/* Category Chips Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Categoria (Corredor do Supermercado)
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = cat.id === category;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sound.playStep();
                      setCategory(cat.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 shadow-sm shadow-blue-500/30 font-semibold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* If Temporary List: Person Assignment Chips */}
          {currentList.type === 'temporary' && currentList.eventDetails?.participants && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Designar para quem levar / comprar:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setAssignedTo(undefined)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    !assignedTo
                      ? 'bg-white/20 text-white border-white/30 font-semibold'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  Qualquer um
                </button>
                {currentList.eventDetails.participants.map((p) => {
                  const isSelected = assignedTo?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        sound.playStep();
                        setAssignedTo(p);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-400 font-semibold shadow-sm'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                      <span>{p.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
                name.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar à Lista</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
