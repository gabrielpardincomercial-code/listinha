import { ListItem, ShoppingList, User } from '../types';

const API_BASE = '/api/sync.php';

export async function getServerConfig(): Promise<{ google_client_id: string }> {
  try {
    const res = await fetch(`${API_BASE}?action=get_config`);
    if (!res.ok) return { google_client_id: '' };
    return await res.json();
  } catch {
    return { google_client_id: '' };
  }
}

export async function saveServerConfig(googleClientId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}?action=save_config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ google_client_id: googleClientId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function userCloudLogin(
  user: User,
  inviteListId?: string | null
): Promise<{
  success: boolean;
  lists: ShoppingList[];
  items: ListItem[];
}> {
  try {
    const res = await fetch(`${API_BASE}?action=user_login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, invite_list_id: inviteListId || null }),
    });
    if (!res.ok) throw new Error('Failed to login on server');
    return await res.json();
  } catch (err) {
    console.warn('Could not sync user login:', err);
    return { success: false, lists: [], items: [] };
  }
}

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
): Promise<{
  exists: boolean;
  list: ShoppingList | null;
  lists?: ShoppingList[];
  items: ListItem[];
}> {
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

export async function saveCloudList(list: ShoppingList, items?: ListItem[]): Promise<void> {
  try {
    await fetch(`${API_BASE}?action=save_list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ list, items }),
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
  userId?: string,
  userEmail?: string
): Promise<{
  success: boolean;
  list?: ShoppingList;
  lists?: ShoppingList[];
  items: ListItem[];
  server_time: number;
} | null> {
  try {
    const params = new URLSearchParams({
      action: 'poll',
      list_id: listId,
      user_id: userId || '',
      user_email: userEmail || '',
    });
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
