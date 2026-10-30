import { ListItem, ShoppingList, User } from '../types';

const API_BASE = '/api/sync.php';

export async function fetchCloudList(listId: string): Promise<{
  exists: boolean;
  list: ShoppingList | null;
  items: ListItem[];
}> {
  try {
    const res = await fetch(`${API_BASE}?action=get_list&list_id=${encodeURIComponent(listId)}`);
    if (!res.ok) throw new Error('Failed to fetch list');
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch cloud list:', err);
    return { exists: false, list: null, items: [] };
  }
}

export async function joinCloudList(
  listId: string,
  user: User
): Promise<{ exists: boolean; list: ShoppingList | null; items: ListItem[] }> {
  try {
    const res = await fetch(`${API_BASE}?action=join_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ list_id: listId, user }),
    });
    if (!res.ok) throw new Error('Failed to join list');
    return await res.json();
  } catch (err) {
    console.warn('Could not join cloud list:', err);
    return { exists: false, list: null, items: [] };
  }
}

export async function saveCloudList(list: ShoppingList): Promise<void> {
  try {
    await fetch(`${API_BASE}?action=save_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ list }),
    });
  } catch (err) {
    console.warn('Could not save cloud list:', err);
  }
}

export async function saveCloudItem(item: ListItem): Promise<void> {
  try {
    await fetch(`${API_BASE}?action=save_item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item }),
    });
  } catch (err) {
    console.warn('Could not save cloud item:', err);
  }
}

export async function toggleCloudItem(
  itemId: string,
  completed: boolean,
  completedBy: { id: string; name: string }
): Promise<void> {
  try {
    await fetch(`${API_BASE}?action=toggle_item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, completed, completed_by: completedBy }),
    });
  } catch (err) {
    console.warn('Could not toggle cloud item:', err);
  }
}

export async function deleteCloudItem(itemId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}?action=delete_item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId }),
    });
  } catch (err) {
    console.warn('Could not delete cloud item:', err);
  }
}

export async function clearCloudCompleted(listId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}?action=clear_completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ list_id: listId }),
    });
  } catch (err) {
    console.warn('Could not clear cloud completed items:', err);
  }
}

export async function pollCloudUpdates(
  listId: string,
  since: number
): Promise<{
  success: boolean;
  has_list_update: boolean;
  list?: ShoppingList;
  items: ListItem[];
  server_time: number;
} | null> {
  try {
    const res = await fetch(
      `${API_BASE}?action=poll&list_id=${encodeURIComponent(listId)}&since=${since}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
