import { ListItem, ShoppingList, SyncStatus, User } from '../types';
import {
  pollCloudUpdates,
  saveCloudItem,
  toggleCloudItem,
  deleteCloudItem,
  clearCloudCompleted,
  saveCloudList,
  deleteCloudList,
} from './api';

type MessagePayload =
  | {
      type: 'ITEM_TOGGLE';
      itemId: string;
      completed: boolean;
      completedBy: { id: string; name: string };
      updatedAt: number;
    }
  | { type: 'ITEM_ADD'; item: ListItem }
  | { type: 'ITEM_UPDATE'; item: ListItem }
  | { type: 'ITEM_DELETE'; itemId: string }
  | { type: 'ITEMS_CLEAR_COMPLETED'; listId: string }
  | { type: 'LIST_UPDATE'; list: ShoppingList; items?: ListItem[] }
  | { type: 'LIST_DELETE'; listId: string }
  | { type: 'SYNC_FULL'; list?: ShoppingList; lists?: ShoppingList[]; items: ListItem[] };

type SyncCallback = (payload: MessagePayload) => void;

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private subscribers: Set<SyncCallback> = new Set();
  private statusListeners: Set<(status: SyncStatus) => void> = new Set();
  private status: SyncStatus = 'connected';
  private pollInterval: number | null = null;
  private currentListId: string = '';
  private currentUser: User | null = null;
  private isPolling: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('listinha_realtime_sync');
        this.channel.onmessage = (event) => {
          if (event.data) {
            this.notifySubscribers(event.data);
          }
        };
      } catch {}

      window.addEventListener('online', () => {
        this.setStatus('connected');
        this.startPolling();
      });
      window.addEventListener('offline', () => {
        this.setStatus('offline');
        this.stopPolling();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopPolling();
        } else {
          this.startPolling();
          this.doPoll();
        }
      });
    }
  }

  public setContext(listId: string, user: User | null) {
    const changed = this.currentListId !== listId || this.currentUser?.id !== user?.id;
    this.currentListId = listId;
    this.currentUser = user;
    if (changed && listId) {
      this.startPolling();
      this.doPoll();
    }
  }

  public startPolling() {
    this.stopPolling();
    if (!this.currentListId || typeof window === 'undefined') return;

    this.pollInterval = window.setInterval(() => {
      this.doPoll();
    }, 2500);
  }

  public stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async doPoll() {
    if (!this.currentListId || this.isPolling) return;
    this.isPolling = true;

    try {
      const data = await pollCloudUpdates(
        this.currentListId,
        this.currentUser?.id,
        this.currentUser?.email
      );
      if (data && data.success) {
        this.setStatus('connected');

        this.notifySubscribers({
          type: 'SYNC_FULL',
          list: data.list,
          lists: data.lists,
          items: data.items,
        });
      }
    } catch {
      // offline safe
    } finally {
      this.isPolling = false;
    }
  }

  public setStatus(status: SyncStatus) {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  public subscribe(callback: SyncCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(payload: MessagePayload) {
    this.subscribers.forEach((cb) => cb(payload));
  }

  public broadcast(payload: MessagePayload) {
    this.setStatus('syncing');

    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch {}
    }

    if (payload.type === 'ITEM_ADD' || payload.type === 'ITEM_UPDATE') {
      saveCloudItem(payload.item).finally(() => this.setStatus('connected'));
    } else if (payload.type === 'ITEM_TOGGLE') {
      toggleCloudItem(payload.itemId, payload.completed, payload.completedBy).finally(() =>
        this.setStatus('connected')
      );
    } else if (payload.type === 'ITEM_DELETE') {
      deleteCloudItem(payload.itemId).finally(() => this.setStatus('connected'));
    } else if (payload.type === 'ITEMS_CLEAR_COMPLETED') {
      clearCloudCompleted(payload.listId).finally(() => this.setStatus('connected'));
    } else if (payload.type === 'LIST_UPDATE') {
      saveCloudList(payload.list, payload.items).finally(() => this.setStatus('connected'));
    } else if (payload.type === 'LIST_DELETE') {
      deleteCloudList(payload.listId).finally(() => this.setStatus('connected'));
    } else {
      setTimeout(() => this.setStatus('connected'), 300);
    }
  }
}

export const realtime = new RealtimeSyncManager();
