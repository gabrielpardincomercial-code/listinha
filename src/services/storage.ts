import { ListItem, ShoppingList, User } from '../types';

export const CURRENT_USER_KEY = 'listinha_user_session';
export const LISTS_KEY = 'listinha_user_lists';
export const ITEMS_KEY = 'listinha_user_items';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch {}
}

export function createDefaultUserList(user: User): ShoppingList {
  return {
    id: `list_familia_${user.id}`,
    title: 'Lista da Família',
    type: 'family',
    emoji: '🏠',
    description: 'Compras semanais e reposição de casa',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ownerId: user.id,
    collaborators: [user],
  };
}

export function getStoredLists(user?: User | null): ShoppingList[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LISTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  // If user is provided, create clean initial list for them
  if (user) {
    const initial = [createDefaultUserList(user)];
    saveStoredLists(initial);
    return initial;
  }

  return [];
}

export function saveStoredLists(lists: ShoppingList[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  } catch {}
}

export function getStoredItems(): ListItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return []; // Clean empty items list by default!
}

export function saveStoredItems(items: ListItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {}
}

export function logoutAndClearSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(LISTS_KEY);
    localStorage.removeItem(ITEMS_KEY);
  } catch {}
}
