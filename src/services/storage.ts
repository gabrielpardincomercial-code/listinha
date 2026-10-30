import { ListItem, ShoppingList, User } from '../types';

export const CURRENT_USER_KEY = 'listinha_user';
export const LISTS_KEY = 'listinha_lists';
export const ITEMS_KEY = 'listinha_items';

export const INITIAL_USER: User = {
  id: 'usr_gabriel',
  name: 'Gabriel Pardin',
  email: 'gabrielpardincomercial@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  isGoogleAuth: true,
  color: '#0A84FF',
};

export const INITIAL_PARTICIPANTS: User[] = [
  INITIAL_USER,
  {
    id: 'usr_camila',
    name: 'Camila (Cônjuge)',
    email: 'camila@familiapardin.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    color: '#FF2D55',
  },
  {
    id: 'usr_lucas',
    name: 'Lucas (Filho)',
    email: 'lucas@familiapardin.com',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    color: '#30D158',
  },
  {
    id: 'usr_julia',
    name: 'Júlia (Amiga)',
    email: 'julia@design.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    color: '#BF5AF2',
  },
  {
    id: 'usr_pedro',
    name: 'Pedro (Amigo)',
    email: 'pedro@tecnologia.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    color: '#FF9500',
  },
];

export const INITIAL_LISTS: ShoppingList[] = [
  {
    id: 'list_familia',
    title: 'Lista da Família',
    type: 'family',
    emoji: '🏠',
    description: 'Compras semanais compartilhadas de casa',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
    ownerId: INITIAL_USER.id,
    collaborators: [INITIAL_USER, INITIAL_PARTICIPANTS[1], INITIAL_PARTICIPANTS[2]],
  },
  {
    id: 'list_happyhour',
    title: 'Happy Hour de Sexta 🍻',
    type: 'temporary',
    emoji: '🍻',
    description: 'Churrasco e confraternização com amigos',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    ownerId: INITIAL_USER.id,
    collaborators: INITIAL_PARTICIPANTS,
    eventDetails: {
      date: 'Sexta-feira às 19:30',
      location: 'Área Gourmet',
      budgetTotal: 380,
      participants: INITIAL_PARTICIPANTS,
    },
  },
];

export const INITIAL_ITEMS: ListItem[] = [
  // Lista da Família
  {
    id: 'item_1',
    listId: 'list_familia',
    name: 'Banana Prata',
    category: 'hortifruti',
    quantityType: 'weight',
    quantity: 1000,
    weightPreset: '1kg',
    unitLabel: 'kg',
    completed: true,
    completedAt: Date.now() - 1800000,
    completedBy: { id: INITIAL_PARTICIPANTS[1].id, name: INITIAL_PARTICIPANTS[1].name },
    createdAt: Date.now() - 86400000 * 2,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },
  {
    id: 'item_2',
    listId: 'list_familia',
    name: 'Tomate Italiano',
    category: 'hortifruti',
    quantityType: 'weight',
    quantity: 500,
    weightPreset: '500g',
    unitLabel: 'g',
    completed: false,
    createdAt: Date.now() - 86400000 * 2,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },
  {
    id: 'item_3',
    listId: 'list_familia',
    name: 'Leite Integral Leitíssimo',
    category: 'laticinios',
    quantityType: 'unit',
    quantity: 3,
    unitLabel: 'L',
    completed: false,
    createdAt: Date.now() - 86400000,
    createdBy: { id: INITIAL_PARTICIPANTS[1].id, name: INITIAL_PARTICIPANTS[1].name },
  },
  {
    id: 'item_4',
    listId: 'list_familia',
    name: 'Pão Francês quentinho',
    category: 'padaria',
    quantityType: 'unit',
    quantity: 6,
    unitLabel: 'un',
    completed: true,
    completedAt: Date.now() - 3600000,
    completedBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
    createdAt: Date.now() - 86400000,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },
  {
    id: 'item_5',
    listId: 'list_familia',
    name: 'Picanha Bovina Maturatta',
    category: 'carnes',
    quantityType: 'weight',
    quantity: 1000,
    weightPreset: '1kg',
    unitLabel: 'kg',
    completed: false,
    createdAt: Date.now() - 3600000 * 5,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },
  {
    id: 'item_6',
    listId: 'list_familia',
    name: 'Detergente Ypê Neutro',
    category: 'limpeza',
    quantityType: 'unit',
    quantity: 2,
    unitLabel: 'un',
    completed: false,
    createdAt: Date.now() - 3600000 * 2,
    createdBy: { id: INITIAL_PARTICIPANTS[1].id, name: INITIAL_PARTICIPANTS[1].name },
  },
  {
    id: 'item_7',
    listId: 'list_familia',
    name: 'Queijo Mussarela fatiado',
    category: 'laticinios',
    quantityType: 'weight',
    quantity: 500,
    weightPreset: '500g',
    unitLabel: 'g',
    completed: false,
    createdAt: Date.now() - 3600000 * 3,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },

  // Happy Hour
  {
    id: 'item_hh_1',
    listId: 'list_happyhour',
    name: 'Cerveja Heineken Long Neck',
    category: 'bebidas',
    quantityType: 'unit',
    quantity: 12,
    unitLabel: 'un',
    completed: true,
    completedAt: Date.now() - 1200000,
    completedBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
    assignedTo: { id: INITIAL_USER.id, name: INITIAL_USER.name, avatar: INITIAL_USER.avatar, color: INITIAL_USER.color },
    createdAt: Date.now() - 86400000,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },
  {
    id: 'item_hh_2',
    listId: 'list_happyhour',
    name: 'Picanha & Linguiça Toscana',
    category: 'carnes',
    quantityType: 'weight',
    quantity: 1500,
    weightPreset: 'custom',
    unitLabel: 'kg',
    completed: false,
    assignedTo: { id: INITIAL_PARTICIPANTS[2].id, name: INITIAL_PARTICIPANTS[2].name, avatar: INITIAL_PARTICIPANTS[2].avatar, color: INITIAL_PARTICIPANTS[2].color },
    createdAt: Date.now() - 86400000,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },
  {
    id: 'item_hh_3',
    listId: 'list_happyhour',
    name: 'Carvão 5kg e Gelo 10kg',
    category: 'mercearia',
    quantityType: 'unit',
    quantity: 2,
    unitLabel: 'pct',
    completed: false,
    assignedTo: { id: INITIAL_PARTICIPANTS[1].id, name: INITIAL_PARTICIPANTS[1].name, avatar: INITIAL_PARTICIPANTS[1].avatar, color: INITIAL_PARTICIPANTS[1].color },
    createdAt: Date.now() - 86400000,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },
  {
    id: 'item_hh_4',
    listId: 'list_happyhour',
    name: 'Gin Tanqueray & Água Tônica',
    category: 'bebidas',
    quantityType: 'unit',
    quantity: 4,
    unitLabel: 'un',
    completed: false,
    assignedTo: { id: INITIAL_PARTICIPANTS[3].id, name: INITIAL_PARTICIPANTS[3].name, avatar: INITIAL_PARTICIPANTS[3].avatar, color: INITIAL_PARTICIPANTS[3].color },
    createdAt: Date.now() - 86400000,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },
  {
    id: 'item_hh_5',
    listId: 'list_happyhour',
    name: 'Refrigerantes Zero & Sucos',
    category: 'bebidas',
    quantityType: 'unit',
    quantity: 3,
    unitLabel: 'un',
    completed: false,
    assignedTo: { id: INITIAL_PARTICIPANTS[4].id, name: INITIAL_PARTICIPANTS[4].name, avatar: INITIAL_PARTICIPANTS[4].avatar, color: INITIAL_PARTICIPANTS[4].color },
    createdAt: Date.now() - 86400000,
    createdBy: { id: INITIAL_USER.id, name: INITIAL_USER.name },
  },
];

export function getStoredUser(): User {
  if (typeof window === 'undefined') return INITIAL_USER;
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : INITIAL_USER;
  } catch {
    return INITIAL_USER;
  }
}

export function saveStoredUser(user: User) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch {}
}

export function getStoredLists(): ShoppingList[] {
  if (typeof window === 'undefined') return INITIAL_LISTS;
  try {
    const data = localStorage.getItem(LISTS_KEY);
    return data ? JSON.parse(data) : INITIAL_LISTS;
  } catch {
    return INITIAL_LISTS;
  }
}

export function saveStoredLists(lists: ShoppingList[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  } catch {}
}

export function getStoredItems(): ListItem[] {
  if (typeof window === 'undefined') return INITIAL_ITEMS;
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: ListItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {}
}
