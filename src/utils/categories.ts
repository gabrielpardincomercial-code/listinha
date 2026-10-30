import { Category, QuantityType, WeightPreset } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'hortifruti',
    name: 'Hortifrúti',
    icon: '🥬',
    color: '#34c759',
    accentBg: 'rgba(52, 199, 89, 0.15)',
  },
  {
    id: 'carnes',
    name: 'Açougue & Carnes',
    icon: '🥩',
    color: '#ff3b30',
    accentBg: 'rgba(255, 59, 48, 0.15)',
  },
  {
    id: 'laticinios',
    name: 'Laticínios & Frios',
    icon: '🥛',
    color: '#0a84ff',
    accentBg: 'rgba(10, 132, 255, 0.15)',
  },
  {
    id: 'padaria',
    name: 'Padaria & Confeitaria',
    icon: '🥖',
    color: '#ff9500',
    accentBg: 'rgba(255, 149, 0, 0.15)',
  },
  {
    id: 'mercearia',
    name: 'Mercearia & Despensa',
    icon: '🥫',
    color: '#ffd60a',
    accentBg: 'rgba(255, 214, 10, 0.15)',
  },
  {
    id: 'bebidas',
    name: 'Bebidas & Adega',
    icon: '🍺',
    color: '#bf5af2',
    accentBg: 'rgba(191, 90, 242, 0.15)',
  },
  {
    id: 'limpeza',
    name: 'Limpeza da Casa',
    icon: '🧼',
    color: '#5ac8fa',
    accentBg: 'rgba(90, 200, 250, 0.15)',
  },
  {
    id: 'higiene',
    name: 'Higiene & Beleza',
    icon: '🧴',
    color: '#ff2d55',
    accentBg: 'rgba(255, 45, 85, 0.15)',
  },
  {
    id: 'congelados',
    name: 'Congelados',
    icon: '❄️',
    color: '#64d2ff',
    accentBg: 'rgba(100, 210, 255, 0.15)',
  },
  {
    id: 'pet',
    name: 'Pet Shop',
    icon: '🐾',
    color: '#ff9f0a',
    accentBg: 'rgba(255, 159, 10, 0.15)',
  },
  {
    id: 'outros',
    name: 'Outros',
    icon: '💡',
    color: '#98989d',
    accentBg: 'rgba(152, 152, 157, 0.15)',
  },
];

export interface SmartSuggestion {
  category: string;
  quantityType: QuantityType;
  defaultQuantity: number;
  weightPreset?: WeightPreset;
  unitLabel: string;
}

const SMART_KEYWORDS: Record<string, SmartSuggestion> = {
  // Hortifruti
  banana: { category: 'hortifruti', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  maçã: { category: 'hortifruti', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  tomate: { category: 'hortifruti', quantityType: 'weight', defaultQuantity: 500, weightPreset: '500g', unitLabel: 'g' },
  cebola: { category: 'hortifruti', quantityType: 'weight', defaultQuantity: 500, weightPreset: '500g', unitLabel: 'g' },
  batata: { category: 'hortifruti', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  alface: { category: 'hortifruti', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  laranja: { category: 'hortifruti', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  limão: { category: 'hortifruti', quantityType: 'weight', defaultQuantity: 500, weightPreset: '500g', unitLabel: 'g' },
  alho: { category: 'hortifruti', quantityType: 'weight', defaultQuantity: 100, weightPreset: '100g', unitLabel: 'g' },
  cenoura: { category: 'hortifruti', quantityType: 'weight', defaultQuantity: 500, weightPreset: '500g', unitLabel: 'g' },
  abacate: { category: 'hortifruti', quantityType: 'unit', defaultQuantity: 2, unitLabel: 'un' },
  morango: { category: 'hortifruti', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'cx' },

  // Carnes
  picanha: { category: 'carnes', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  alcatra: { category: 'carnes', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  frango: { category: 'carnes', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  carne: { category: 'carnes', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  moída: { category: 'carnes', quantityType: 'weight', defaultQuantity: 500, weightPreset: '500g', unitLabel: 'g' },
  costela: { category: 'carnes', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  linguiça: { category: 'carnes', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  bacon: { category: 'carnes', quantityType: 'weight', defaultQuantity: 500, weightPreset: '500g', unitLabel: 'g' },
  peixe: { category: 'carnes', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  salmão: { category: 'carnes', quantityType: 'weight', defaultQuantity: 500, weightPreset: '500g', unitLabel: 'g' },

  // Laticinios
  leite: { category: 'laticinios', quantityType: 'unit', defaultQuantity: 2, unitLabel: 'L' },
  queijo: { category: 'laticinios', quantityType: 'weight', defaultQuantity: 500, weightPreset: '500g', unitLabel: 'g' },
  mussarela: { category: 'laticinios', quantityType: 'weight', defaultQuantity: 500, weightPreset: '500g', unitLabel: 'g' },
  presunto: { category: 'laticinios', quantityType: 'weight', defaultQuantity: 300, weightPreset: 'custom', unitLabel: 'g' },
  manteiga: { category: 'laticinios', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  iogurte: { category: 'laticinios', quantityType: 'unit', defaultQuantity: 4, unitLabel: 'un' },
  ovos: { category: 'laticinios', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'dz' },
  requeijão: { category: 'laticinios', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },

  // Padaria
  pão: { category: 'padaria', quantityType: 'unit', defaultQuantity: 6, unitLabel: 'un' },
  bolo: { category: 'padaria', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  torrada: { category: 'padaria', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'pct' },
  croissant: { category: 'padaria', quantityType: 'unit', defaultQuantity: 4, unitLabel: 'un' },

  // Mercearia
  arroz: { category: 'mercearia', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  feijão: { category: 'mercearia', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  macarrão: { category: 'mercearia', quantityType: 'unit', defaultQuantity: 2, unitLabel: 'pct' },
  óleo: { category: 'mercearia', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  açúcar: { category: 'mercearia', quantityType: 'weight', defaultQuantity: 1000, weightPreset: '1kg', unitLabel: 'kg' },
  café: { category: 'mercearia', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'pct' },
  azeite: { category: 'mercearia', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  molho: { category: 'mercearia', quantityType: 'unit', defaultQuantity: 2, unitLabel: 'un' },

  // Bebidas
  cerveja: { category: 'bebidas', quantityType: 'unit', defaultQuantity: 6, unitLabel: 'lata' },
  vinho: { category: 'bebidas', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'gf' },
  refrigerante: { category: 'bebidas', quantityType: 'unit', defaultQuantity: 2, unitLabel: 'un' },
  coca: { category: 'bebidas', quantityType: 'unit', defaultQuantity: 2, unitLabel: 'un' },
  suco: { category: 'bebidas', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'L' },
  água: { category: 'bebidas', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'galão' },
  gin: { category: 'bebidas', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'gf' },
  gelo: { category: 'bebidas', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'pct' },
  tônica: { category: 'bebidas', quantityType: 'unit', defaultQuantity: 4, unitLabel: 'lata' },

  // Limpeza
  detergente: { category: 'limpeza', quantityType: 'unit', defaultQuantity: 2, unitLabel: 'un' },
  sabão: { category: 'limpeza', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'cx' },
  amaciante: { category: 'limpeza', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  desinfetante: { category: 'limpeza', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  esponja: { category: 'limpeza', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'pct' },
  lixo: { category: 'limpeza', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'pct' },

  // Higiene
  shampoo: { category: 'higiene', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  sabonete: { category: 'higiene', quantityType: 'unit', defaultQuantity: 4, unitLabel: 'un' },
  pasta: { category: 'higiene', quantityType: 'unit', defaultQuantity: 2, unitLabel: 'un' },
  escova: { category: 'higiene', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  desodorante: { category: 'higiene', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'un' },
  papel: { category: 'higiene', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'pct' },

  // Congelados
  pizza: { category: 'congelados', quantityType: 'unit', defaultQuantity: 2, unitLabel: 'un' },
  sorvete: { category: 'congelados', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'pote' },
  hambúrguer: { category: 'congelados', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'cx' },

  // Pet
  ração: { category: 'pet', quantityType: 'weight', defaultQuantity: 3000, weightPreset: 'custom', unitLabel: 'kg' },
  petisco: { category: 'pet', quantityType: 'unit', defaultQuantity: 1, unitLabel: 'pct' },
};

export function detectSmartCategory(name: string): SmartSuggestion {
  const clean = name.toLowerCase().trim();
  for (const [key, value] of Object.entries(SMART_KEYWORDS)) {
    if (clean.includes(key)) {
      return value;
    }
  }

  return {
    category: 'mercearia',
    quantityType: 'unit',
    defaultQuantity: 1,
    unitLabel: 'un',
  };
}

export function formatQuantityDisplay(item: {
  quantityType: QuantityType;
  quantity: number;
  weightPreset?: WeightPreset;
  unitLabel: string;
  customQuantity?: string;
}): string {
  if (item.customQuantity && item.customQuantity.trim()) {
    return item.customQuantity;
  }

  if (item.quantityType === 'weight') {
    if (item.quantity >= 1000) {
      const kg = item.quantity / 1000;
      return `${kg % 1 === 0 ? kg : kg.toFixed(1)}kg`;
    }
    return `${item.quantity}g`;
  }

  return `${item.quantity} ${item.unitLabel || 'un'}`;
}
