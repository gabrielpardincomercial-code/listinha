import React, { useState, useEffect, useRef } from 'react';
import {
  SendHorizontal,
  Minus,
  Plus,
  Scale,
  Package,
  Sparkles,
  Check,
  Edit3,
  Layers,
} from 'lucide-react';
import { ListItem, QuantityType, ShoppingList, User, WeightPreset } from '../types';
import { CATEGORIES, detectSmartCategory } from '../utils/categories';
import { sound } from '../utils/audio';

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (itemData: Omit<ListItem, 'id' | 'createdAt' | 'completed' | 'listId'>) => void;
  currentList: ShoppingList;
  currentUser: User;
  onKeyboardOffsetChange?: (offsetPx: number) => void;
  onAddingModeChange?: (isAdding: boolean) => void;
}

const WEIGHT_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 5000,
];

export const AddItemSheet: React.FC<AddItemSheetProps> = ({
  isOpen,
  onClose,
  onAddItem,
  currentList,
  currentUser,
  onKeyboardOffsetChange,
  onAddingModeChange,
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
  const [isFocused, setIsFocused] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // When triggered externally (e.g. "Começar a Digitar" button), focus the WhatsApp input bar
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
      onAddingModeChange?.(true);
    }
  }, [isOpen, onAddingModeChange]);

  // Track mobile virtual keyboard height via visualViewport (WhatsApp-style push-up behavior)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const vv = window.visualViewport;
    const updateViewport = () => {
      const offset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      setKeyboardOffset(offset);
      onKeyboardOffsetChange?.(offset);
    };

    vv.addEventListener('resize', updateViewport);
    vv.addEventListener('scroll', updateViewport);
    updateViewport();

    return () => {
      vv.removeEventListener('resize', updateViewport);
      vv.removeEventListener('scroll', updateViewport);
    };
  }, [onKeyboardOffsetChange]);

  // Auto-detect category & quantity defaults as user types
  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed.length >= 2) {
      const smart = detectSmartCategory(trimmed);
      setCategory(smart.category);
      setQuantityType(smart.quantityType);
      setQuantity(smart.defaultQuantity);
      if (smart.weightPreset) {
        setWeightPreset(smart.weightPreset);
      }
      setUnitLabel(smart.unitLabel);
      setAutoDetected(true);
    } else if (trimmed.length === 0) {
      setAutoDetected(false);
    }
  }, [name]);

  // Prevent button taps from blurring the text input so the keyboard stays open & steady like WhatsApp
  const keepKeyboardOpen = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
  };

  const handleDecrement = () => {
    sound.playStep();
    if (quantityType === 'unit') {
      if (quantity > 1) setQuantity(quantity - 1);
    } else {
      const prevSteps = [...WEIGHT_STEPS].reverse();
      const prev = prevSteps.find((s) => s < quantity);
      const nextVal = prev !== undefined ? prev : 100;
      setQuantity(nextVal);
      setUnitLabel(nextVal >= 1000 ? 'kg' : 'g');
      if (nextVal === 100) setWeightPreset('100g');
      else if (nextVal === 500) setWeightPreset('500g');
      else if (nextVal === 1000) setWeightPreset('1kg');
      else setWeightPreset('custom');
    }
  };

  const handleIncrement = () => {
    sound.playStep();
    if (quantityType === 'unit') {
      setQuantity(quantity + 1);
    } else {
      const next = WEIGHT_STEPS.find((s) => s > quantity);
      const nextVal = next !== undefined ? next : quantity + 500;
      setQuantity(nextVal);
      setUnitLabel(nextVal >= 1000 ? 'kg' : 'g');
      if (nextVal === 100) setWeightPreset('100g');
      else if (nextVal === 500) setWeightPreset('500g');
      else if (nextVal === 1000) setWeightPreset('1kg');
      else setWeightPreset('custom');
    }
  };

  const handleSelectWeightPreset = (preset: '100g' | '500g' | '1kg') => {
    sound.playStep();
    setShowCustomInput(false);
    setQuantityType('weight');
    const grams = preset === '100g' ? 100 : preset === '500g' ? 500 : 1000;
    setQuantity(grams);
    setWeightPreset(preset);
    setUnitLabel(grams >= 1000 ? 'kg' : 'g');
  };

  const toggleQuantityMode = () => {
    sound.playStep();
    setShowCustomInput(false);
    if (quantityType === 'unit') {
      setQuantityType('weight');
      setQuantity(100);
      setWeightPreset('100g');
      setUnitLabel('g');
    } else {
      setQuantityType('unit');
      setQuantity(1);
      setUnitLabel('un');
    }
  };

  const handleFinishAndCategorize = () => {
    sound.playSuccess();
    setIsFocused(false);
    setShowCustomInput(false);
    onAddingModeChange?.(false);
    onClose();
    inputRef.current?.blur();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    sound.playStep();
    onAddingModeChange?.(true);

    onAddItem({
      name: name.trim(),
      category,
      quantityType: showCustomInput && customQuantity.trim() ? 'custom' : quantityType,
      quantity,
      weightPreset,
      unitLabel,
      customQuantity: showCustomInput && customQuantity.trim() ? customQuantity.trim() : undefined,
      createdBy: { id: currentUser.id, name: currentUser.name },
      assignedTo: assignedTo
        ? {
            id: assignedTo.id,
            name: assignedTo.name,
            avatar: assignedTo.avatar,
            color: assignedTo.color,
          }
        : undefined,
    });

    // Reset item name & reset quantity to default for next quick entry (keeping keyboard open!)
    setName('');
    setQuantityType('unit');
    setQuantity(1);
    setWeightPreset('100g');
    setUnitLabel('un');
    setCustomQuantity('');
    setShowCustomInput(false);
    setAutoDetected(false);

    // Keep focus inside input so user can type next item immediately like WhatsApp
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const formattedQuantity =
    showCustomInput && customQuantity.trim()
      ? customQuantity.trim()
      : quantityType === 'unit'
      ? `${quantity} un`
      : quantity >= 1000
      ? `${(quantity / 1000) % 1 === 0 ? quantity / 1000 : (quantity / 1000).toFixed(1)}kg`
      : `${quantity}g`;

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const showExpandedStrip = isFocused || name.trim().length > 0 || isOpen;

  return (
    <div
      style={{
        bottom: `${keyboardOffset}px`,
        paddingBottom: keyboardOffset > 0 ? '6px' : 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
      }}
      className="fixed left-0 right-0 z-40 bg-[#0b0f19]/95 backdrop-blur-2xl border-t border-white/15 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] transition-[bottom] duration-75"
    >
      <div className="max-w-3xl mx-auto px-2.5 pt-2">
        {/* Compact Context Strip right above the input (never hidden by keyboard) */}
        {showExpandedStrip && (
          <div className="space-y-1.5 mb-2 animate-fade-in">
            {/* Row 1: Unit vs Weight (100g / 500g / 1kg / Custom) + Finish & Categorize Button */}
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {/* Switch Unidade / Quilo */}
                <button
                  type="button"
                  onMouseDown={keepKeyboardOpen}
                  onClick={() => {
                    sound.playStep();
                    setShowCustomInput(false);
                    setQuantityType('unit');
                    setQuantity(1);
                    setUnitLabel('un');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border flex-shrink-0 ${
                    quantityType === 'unit' && !showCustomInput
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Package className="w-3 h-3" />
                  <span>Un</span>
                </button>

                <button
                  type="button"
                  onMouseDown={keepKeyboardOpen}
                  onClick={() => {
                    sound.playStep();
                    setShowCustomInput(false);
                    setQuantityType('weight');
                    if (quantity < 100) setQuantity(100);
                    setUnitLabel(quantity >= 1000 ? 'kg' : 'g');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border flex-shrink-0 ${
                    quantityType === 'weight' && !showCustomInput
                      ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Scale className="w-3 h-3" />
                  <span>Kg/g</span>
                </button>

                {/* Weight Quick Presets: 100g, 500g, 1kg */}
                {quantityType === 'weight' && !showCustomInput && (
                  <div className="flex items-center gap-1 ml-0.5 pl-1 border-l border-white/10 flex-shrink-0">
                    {(['100g', '500g', '1kg'] as const).map((preset) => {
                      const active =
                        (preset === '100g' && quantity === 100) ||
                        (preset === '500g' && quantity === 500) ||
                        (preset === '1kg' && quantity === 1000);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onMouseDown={keepKeyboardOpen}
                          onClick={() => handleSelectWeightPreset(preset)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            active
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'bg-white/10 text-slate-300 hover:bg-white/15'
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Custom specific weight/measure toggle */}
                <button
                  type="button"
                  onMouseDown={keepKeyboardOpen}
                  onClick={() => {
                    sound.playStep();
                    setShowCustomInput(!showCustomInput);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium transition-all border flex-shrink-0 ${
                    showCustomInput
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Outro</span>
                </button>
              </div>

              {/* Finish Adding & Separate by Categories Button */}
              <button
                type="button"
                onClick={handleFinishAndCategorize}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 hover:text-white flex-shrink-0 transition-all active:scale-95"
                title="Terminar adição e separar itens por categoria"
              >
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Pronto • Categorizar</span>
              </button>
            </div>

            {/* Optional Custom Specific Measure Input */}
            {showCustomInput && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Digite o peso ou medida exata (ex: 350g, 1.8kg, 2 caixas)..."
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-purple-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            )}

            {/* Row 2: Horizontal Category Chips + Temporary List Participant Assignment */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {autoDetected && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                  Auto
                </span>
              )}

              {CATEGORIES.map((cat) => {
                const isSelected = cat.id === category;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onMouseDown={keepKeyboardOpen}
                    onClick={() => {
                      sound.playStep();
                      setCategory(cat.id);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
                      isSelected
                        ? 'bg-blue-600/90 text-white border-blue-400 font-semibold shadow-sm'
                        : 'bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}

              {/* If Temporary / Happy Hour List: quick assignee pills */}
              {currentList.type === 'temporary' && currentList.eventDetails?.participants && (
                <>
                  <div className="h-3.5 w-[1px] bg-white/15 mx-1 flex-shrink-0" />
                  {currentList.eventDetails.participants.map((p) => {
                    const isSelected = assignedTo?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={keepKeyboardOpen}
                        onClick={() => {
                          sound.playStep();
                          setAssignedTo(isSelected ? undefined : p);
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-400 font-semibold'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                        <span>{p.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* Main WhatsApp-Style Composer Row: [Item Input] + [- Qty +] + [Send Arrow Button] */}
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          {/* Unified Pill containing Item Input + Inline Stepper */}
          <div className="flex-1 flex items-center bg-[#161c2a] border border-white/15 focus-within:border-blue-500/80 rounded-full pl-3 pr-1.5 py-1 shadow-inner transition-colors min-w-0">
            {/* Selected Category Emoji Indicator */}
            <button
              type="button"
              onMouseDown={keepKeyboardOpen}
              onClick={() => setIsFocused((prev) => !prev)}
              className="text-base mr-2 flex-shrink-0 hover:scale-110 transition-transform"
              title={`Categoria: ${selectedCategoryObj.name}`}
            >
              {selectedCategoryObj.icon}
            </button>

            {/* Item Name Input */}
            <input
              ref={inputRef}
              type="text"
              enterKeyHint="send"
              placeholder="Adicionar item (ex: Arroz, Picanha)..."
              value={name}
              onFocus={() => {
                setIsFocused(true);
                onAddingModeChange?.(true);
              }}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none min-w-0 py-1.5"
            />

            {/* Inline Quantity Controls right inside the bar */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-full px-1 py-0.5 ml-1 flex-shrink-0">
              <button
                type="button"
                onMouseDown={keepKeyboardOpen}
                onClick={handleDecrement}
                disabled={
                  (quantityType === 'unit' && quantity <= 1) ||
                  (quantityType === 'weight' && quantity <= 100)
                }
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 active:scale-90 transition-all"
                aria-label="Diminuir quantidade"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onMouseDown={keepKeyboardOpen}
                onClick={toggleQuantityMode}
                title="Toque para alternar entre Unidade (un) e Peso (g/kg)"
                className="px-1.5 text-xs font-extrabold text-blue-400 hover:text-blue-300 tabular-nums whitespace-nowrap"
              >
                {formattedQuantity}
              </button>

              <button
                type="button"
                onMouseDown={keepKeyboardOpen}
                onClick={handleIncrement}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-600/80 hover:bg-blue-500 text-white active:scale-90 transition-all"
                aria-label="Aumentar quantidade"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* WhatsApp-Style Right Arrow Send Button */}
          <button
            type="submit"
            onMouseDown={keepKeyboardOpen}
            disabled={!name.trim()}
            aria-label="Adicionar item"
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${
              name.trim()
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 scale-100 active:scale-90 shadow-emerald-500/30 cursor-pointer'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            <SendHorizontal className="w-5 h-5 stroke-[2.5] translate-x-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
