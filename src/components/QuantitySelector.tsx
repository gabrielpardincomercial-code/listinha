import React from 'react';
import { Minus, Plus, Scale, Package, Edit3 } from 'lucide-react';
import { QuantityType, WeightPreset } from '../types';
import { sound } from '../utils/audio';

interface QuantitySelectorProps {
  quantityType: QuantityType;
  quantity: number;
  weightPreset?: WeightPreset;
  unitLabel: string;
  customQuantity?: string;
  onChange: (data: {
    quantityType: QuantityType;
    quantity: number;
    weightPreset?: WeightPreset;
    unitLabel: string;
    customQuantity?: string;
  }) => void;
}

const WEIGHT_STEPS = [100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 5000];

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantityType,
  quantity,
  weightPreset = '100g',
  unitLabel,
  customQuantity = '',
  onChange,
}) => {
  // Stepper handlers for Unit
  const handleUnitIncrement = () => {
    sound.playStep();
    onChange({
      quantityType: 'unit',
      quantity: quantity + 1,
      unitLabel: unitLabel || 'un',
    });
  };

  const handleUnitDecrement = () => {
    sound.playStep();
    if (quantity > 1) {
      onChange({
        quantityType: 'unit',
        quantity: quantity - 1,
        unitLabel: unitLabel || 'un',
      });
    }
  };

  // Stepper handlers for Weight
  const handleWeightIncrement = () => {
    sound.playStep();
    const nextStep = WEIGHT_STEPS.find((s) => s > quantity);
    const newQty = nextStep !== undefined ? nextStep : quantity + 500;
    
    let preset: WeightPreset = 'custom';
    if (newQty === 100) preset = '100g';
    else if (newQty === 500) preset = '500g';
    else if (newQty === 1000) preset = '1kg';

    onChange({
      quantityType: 'weight',
      quantity: newQty,
      weightPreset: preset,
      unitLabel: newQty >= 1000 ? 'kg' : 'g',
    });
  };

  const handleWeightDecrement = () => {
    sound.playStep();
    const prevSteps = [...WEIGHT_STEPS].reverse();
    const prevStep = prevSteps.find((s) => s < quantity);
    const newQty = prevStep !== undefined ? prevStep : 100;

    let preset: WeightPreset = 'custom';
    if (newQty === 100) preset = '100g';
    else if (newQty === 500) preset = '500g';
    else if (newQty === 1000) preset = '1kg';

    onChange({
      quantityType: 'weight',
      quantity: newQty,
      weightPreset: preset,
      unitLabel: newQty >= 1000 ? 'kg' : 'g',
    });
  };

  // Quick preset button click (100g, 500g, 1kg)
  const handleSelectWeightPreset = (preset: '100g' | '500g' | '1kg') => {
    sound.playStep();
    const grams = preset === '100g' ? 100 : preset === '500g' ? 500 : 1000;
    onChange({
      quantityType: 'weight',
      quantity: grams,
      weightPreset: preset,
      unitLabel: grams >= 1000 ? 'kg' : 'g',
    });
  };

  return (
    <div className="space-y-3">
      {/* Segmented Control */}
      <div className="flex p-1 bg-slate-900/80 rounded-2xl border border-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => {
            sound.playStep();
            onChange({
              quantityType: 'unit',
              quantity: quantityType === 'unit' ? quantity : 1,
              unitLabel: 'un',
            });
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-all ${
            quantityType === 'unit'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Unidades</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playStep();
            onChange({
              quantityType: 'weight',
              quantity: quantityType === 'weight' ? quantity : 100,
              weightPreset: '100g',
              unitLabel: 'g',
            });
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-all ${
            quantityType === 'weight'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Quilo / Gramas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playStep();
            onChange({
              quantityType: 'custom',
              quantity: 1,
              unitLabel: 'un',
              customQuantity: customQuantity || '',
            });
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-all ${
            quantityType === 'custom'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Personalizado</span>
        </button>
      </div>

      {/* Mode: Unit (Starts at 1, + and -) */}
      {quantityType === 'unit' && (
        <div className="flex items-center justify-between p-3 bg-white/[0.04] rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Quantidade:</span>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={handleUnitDecrement}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                quantity <= 1
                  ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="text-lg font-bold min-w-8 text-center text-white tabular-nums">
              {quantity} <span className="text-xs font-normal text-slate-400">{unitLabel || 'un'}</span>
            </span>

            <button
              type="button"
              onClick={handleUnitIncrement}
              className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all shadow-sm shadow-blue-600/40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mode: Weight (Starts at 100g, 500g, 1kg presets + / - and custom input) */}
      {quantityType === 'weight' && (
        <div className="space-y-2.5 p-3 bg-white/[0.04] rounded-2xl border border-white/10">
          {/* Presets: 100g, 500g, 1kg */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-medium">Pré-selecionados:</span>
            <div className="flex gap-1.5">
              {(['100g', '500g', '1kg'] as const).map((p) => {
                const isSelected =
                  (p === '100g' && quantity === 100) ||
                  (p === '500g' && quantity === 500) ||
                  (p === '1kg' && quantity === 1000);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSelectWeightPreset(p)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-white/10 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper with +/- */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-xs text-slate-400">Ajustar peso:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={quantity <= 100}
                onClick={handleWeightDecrement}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  quantity <= 100
                    ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
                }`}
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="text-base font-bold min-w-16 text-center text-white tabular-nums">
                {quantity >= 1000
                  ? `${(quantity / 1000) % 1 === 0 ? quantity / 1000 : (quantity / 1000).toFixed(1)} kg`
                  : `${quantity} g`}
              </span>

              <button
                type="button"
                onClick={handleWeightIncrement}
                className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all shadow-sm shadow-blue-600/40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode: Custom Input (ex: 350g, 2.5kg, 3 caixas, 2 garrafas) */}
      {quantityType === 'custom' && (
        <div className="p-3 bg-white/[0.04] rounded-2xl border border-white/10 space-y-2">
          <label className="text-xs text-slate-400 font-medium block">
            Digite a quantidade e medida exata:
          </label>
          <input
            type="text"
            placeholder="Ex: 350g, 1.8kg, 3 caixas, 2 garrafas"
            value={customQuantity}
            onChange={(e) =>
              onChange({
                quantityType: 'custom',
                quantity: 1,
                unitLabel: 'custom',
                customQuantity: e.target.value,
              })
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      )}
    </div>
  );
};
