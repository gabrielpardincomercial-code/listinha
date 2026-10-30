export type QuantityType = 'unit' | 'weight' | 'custom';

export type WeightPreset = '100g' | '500g' | '1kg' | 'custom';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color?: string;
  isGoogleAuth?: boolean;
  sessionToken?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  accentBg: string;
}

export interface ListItem {
  id: string;
  listId: string;
  name: string;
  category: string;
  quantityType: QuantityType;
  quantity: number; // e.g. 1, 2 for unit; grams for weight (100, 500, 1000)
  weightPreset?: WeightPreset;
  unitLabel: string; // 'un', 'g', 'kg', 'L', 'pct', etc.
  customQuantity?: string;
  completed: boolean;
  completedAt?: number;
  completedBy?: {
    id: string;
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
  };
  priceEstimate?: number;
  note?: string;
  createdAt: number;
  createdBy: {
    id: string;
    name: string;
  };
}

export type ListType = 'family' | 'temporary';

export interface ShoppingList {
  id: string;
  title: string;
  type: ListType;
  description?: string;
  emoji: string;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
  collaborators: User[];
  eventDetails?: {
    date?: string;
    location?: string;
    budgetTotal?: number;
    participants: User[];
  };
}

export type SyncStatus = 'connected' | 'syncing' | 'offline';
