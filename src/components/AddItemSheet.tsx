import React, { useState, useEffect, useRef } from 'react';
import { SendHorizontal, Minus, Plus } from 'lucide-react';
import { ListItem, QuantityType, ShoppingList, User, WeightPreset } from '../types';
import { detectSmartCategory } from '../utils/categories';
import { sound } from '../utils/audio';

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (itemData: Omit<ListItem, 'id' | 'createdAt' | 'completed' | 'listId'>) => void;
  currentList: ShoppingList;
  currentUser: User;
  onAddingModeChange?: (isAdding: boolean) => void;
  isKeyboardOpen?: boolean;
}

const WEIGHT_STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 5000,
];

export const AddItemSheet: React.FC<AddItemSheetProps> = ({
  isOpen,
  onClose,
  onAddItem,
  currentUser,
  onAddingModeChange,
  isKeyboardOpen = false,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('mercearia');
  const [quantityType, setQuantityType] = useState<QuantityType>('unit');
  const [quantity, setQuantity] = useState<number>(1);
  const [weightPreset, setWeightPreset] = useState<WeightPreset>('100g');
  const [unitLabel, setUnitLabel] = useState('un');
  const [manualQuantity, setManualQuantity] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      onAddingModeChange?.(true);
    }
  }, [isOpen, onAddingModeChange]);

  // Auto-detect category & default unit/weight as user types
  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed.length >= 2) {
      const smart = detectSmartCategory(trimmed);
      setCategory(smart.category);
      if (!manualQuantity) {
        setQuantityType(smart.quantityType);
        if (smart.quantityType === 'weight') {
          setQuantity(100);
          setWeightPreset('100g');
          setUnitLabel('g');
        } else {
          setQuantity(1);
          setUnitLabel('un');
        }
      }
    } else if (trimmed.length === 0) {
      setManualQuantity(false);
    }
  }, [name, manualQuantity]);

  const keepKeyboardOpen = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
  };

  const handleDecrement = () => {
    sound.playStep();
    setManualQuantity(true);
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
    setManualQuantity(true);
    if (quantityType === 'unit') {
      setQuantity(quantity + 1);
    } else {
      let nextVal = quantity + 500;
      if (quantity === 100) nextVal = 500;
      else if (quantity === 500) nextVal = 1000;
      else {
        const next = WEIGHT_STEPS.find((s) => s > quantity);
        nextVal = next !== undefined ? next : quantity + 500;
      }
      setQuantity(nextVal);
      setUnitLabel(nextVal >= 1000 ? 'kg' : 'g');
      if (nextVal === 100) setWeightPreset('100g');
      else if (nextVal === 500) setWeightPreset('500g');
      else if (nextVal === 1000) setWeightPreset('1kg');
      else setWeightPreset('custom');
    }
  };

  const toggleQuantityMode = () => {
    sound.playStep();
    setManualQuantity(true);
    if (quantityType === 'unit') {
      setQuantityType('weight');
      setQuantity(100);
      setWeightPreset('100g');
      setUnitLabel('g');
    } else if (quantityType === 'weight' && quantity === 100) {
      setQuantity(500);
      setWeightPreset('500g');
      setUnitLabel('g');
    } else if (quantityType === 'weight' && quantity === 500) {
      setQuantity(1000);
      setWeightPreset('1kg');
      setUnitLabel('kg');
    } else {
      setQuantityType('unit');
      setQuantity(1);
      setUnitLabel('un');
    }
  };

  const handleSend = () => {
    if (!name.trim()) return;

    sound.playStep();
    onAddingModeChange?.(true);

    const detected = detectSmartCategory(name.trim());

    onAddItem({
      name: name.trim(),
      category: detected.category || category,
      quantityType,
      quantity,
      weightPreset,
      unitLabel,
      createdBy: { id: currentUser.id, name: currentUser.name },
    });

    setName('');
    setQuantityType('unit');
    setQuantity(1);
    setWeightPreset('100g');
    setUnitLabel('un');
    setManualQuantity(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const formattedQuantity =
    quantityType === 'unit'
      ? `${quantity} un`
      : quantity >= 1000
      ? `${(quantity / 1000) % 1 === 0 ? quantity / 1000 : (quantity / 1000).toFixed(1)}kg`
      : `${quantity}g`;

  return (
    <div
      style={{
        paddingBottom: isKeyboardOpen
          ? '6px'
          : 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
      }}
      className="w-full flex-shrink-0 bg-[#0b0f19] border-t border-white/15 pt-2 px-2.5 z-40"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Unified Pill: [Item Text Input] + [- Quantity/Unit +] */}
          <div className="flex-1 flex items-center bg-[#161c2a] border border-white/15 focus-within:border-blue-500/80 rounded-full pl-4 pr-1.5 py-1 shadow-inner min-w-0">
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              autoCorrect="on"
              enterKeyHint="send"
              placeholder="Digite o item..."
              value={name}
              onFocus={() => onAddingModeChange?.(true)}
              onBlur={() => {
                onClose();
                onAddingModeChange?.(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none min-w-0 py-1.5"
            />

            {/* Inline Quantity & Unit Switcher */}
            <div className="flex items-center gap-0.5 bg-black/50 border border-white/10 rounded-full px-1 py-0.5 ml-1.5 flex-shrink-0">
              <button
                type="button"
                tabIndex={-1}
                onPointerDown={keepKeyboardOpen}
                onMouseDown={keepKeyboardOpen}
                onClick={handleDecrement}
                disabled={
                  (quantityType === 'unit' && quantity <= 1) ||
                  (quantityType === 'weight' && quantity <= 100)
                }
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 active:scale-90 transition-all"
                aria-label="Diminuir"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                tabIndex={-1}
                onPointerDown={keepKeyboardOpen}
                onMouseDown={keepKeyboardOpen}
                onClick={toggleQuantityMode}
                title="Toque para trocar entre un, 100g, 500g e 1kg"
                className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-extrabold text-blue-300 active:scale-95 tabular-nums whitespace-nowrap"
              >
                {formattedQuantity}
              </button>

              <button
                type="button"
                tabIndex={-1}
                onPointerDown={keepKeyboardOpen}
                onMouseDown={keepKeyboardOpen}
                onClick={handleIncrement}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white active:scale-90 transition-all"
                aria-label="Aumentar"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* WhatsApp-Style Send Arrow Button */}
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={keepKeyboardOpen}
            onMouseDown={keepKeyboardOpen}
            onClick={handleSend}
            disabled={!name.trim()}
            aria-label="Enviar item"
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-md ${
              name.trim()
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-90 shadow-emerald-500/30 cursor-pointer'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            <SendHorizontal className="w-5 h-5 stroke-[2.5] translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
