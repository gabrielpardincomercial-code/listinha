import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Search, Share2 } from 'lucide-react';
import { ListItem, ShoppingList, SyncStatus, User } from './types';
import {
  getStoredUser,
  saveStoredUser,
  getStoredLists,
  saveStoredLists,
  getStoredItems,
  saveStoredItems,
  logoutAndClearSession,
  createDefaultUserList,
} from './services/storage';
import { realtime } from './services/realtime';
import { verifyUserSession, saveCloudList } from './services/api';
import { CATEGORIES } from './utils/categories';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { ListTabs } from './components/ListTabs';
import { SummaryStats } from './components/SummaryStats';
import { CategoryGroup } from './components/CategoryGroup';
import { AddItemSheet } from './components/AddItemSheet';
import { ShareModal } from './components/ShareModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { NewListModal } from './components/NewListModal';
import { LoginScreen } from './components/LoginScreen';

export const App: React.FC = () => {
  // Check URL parameters for invites and persist in sessionStorage so it's never lost
  const inviteListId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('list');
      if (fromUrl) {
        try {
          sessionStorage.setItem('listinha_pending_invite', fromUrl);
        } catch {}
        return fromUrl;
      }
      try {
        return sessionStorage.getItem('listinha_pending_invite');
      } catch {}
    }
    return null;
  }, []);

  // Core Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser);

  // Lists and items state
  const [lists, setLists] = useState<ShoppingList[]>(() => {
    const user = getStoredUser();
    return getStoredLists(user);
  });

  const [activeListId, setActiveListId] = useState<string>(() => {
    if (inviteListId) return inviteListId;
    const user = getStoredUser();
    const loadedLists = getStoredLists(user);
    return loadedLists[0]?.id || '';
  });

  const [items, setItems] = useState<ListItem[]>(getStoredItems);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connected');

  // Filter & Search state
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed' | 'my_items'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);

  // Sync status listener
  useEffect(() => {
    const unsub = realtime.onStatusChange(setSyncStatus);
    return unsub;
  }, []);

  // Update realtime context whenever activeListId or currentUser changes
  useEffect(() => {
    if (activeListId && currentUser) {
      realtime.setContext(activeListId, currentUser);
    } else {
      realtime.stopPolling();
    }
  }, [activeListId, currentUser]);

  // Logout handler
  const handleLogout = () => {
    realtime.stopPolling();
    logoutAndClearSession();
    setCurrentUser(null);
    setLists([]);
    setItems([]);
    setActiveListId('');
  };

  // Verify existing user session token with server on mount
  useEffect(() => {
    if (currentUser) {
      verifyUserSession(currentUser, inviteListId).then((res) => {
        if (!res.valid) {
          // Session token is invalid or missing in SQLite -> force logout
          handleLogout();
          return;
        }
        if (res.lists && res.lists.length > 0) {
          setLists(res.lists);
          saveStoredLists(res.lists);
          setItems(res.items || []);
          saveStoredItems(res.items || []);

          if (inviteListId && res.lists.some((l) => l.id === inviteListId)) {
            setActiveListId(inviteListId);
            try {
              sessionStorage.removeItem('listinha_pending_invite');
            } catch {}
          } else if (!activeListId || !res.lists.some((l) => l.id === activeListId)) {
            setActiveListId(res.lists[0].id);
          }
        }
      });
    }
  }, []);

  // Realtime subscriber for updates from cloud polling & other tabs
  useEffect(() => {
    const unsub = realtime.subscribe((payload) => {
      if (payload.type === 'SYNC_FULL') {
        if (payload.lists && payload.lists.length > 0) {
          setLists(payload.lists);
          saveStoredLists(payload.lists);
        } else if (payload.list) {
          setLists((prev) => {
            const exists = prev.some((l) => l.id === payload.list!.id);
            const updated = exists
              ? prev.map((l) => (l.id === payload.list!.id ? payload.list! : l))
              : [...prev, payload.list!];
            saveStoredLists(updated);
            return updated;
          });
        }
        if (Array.isArray(payload.items)) {
          setItems(payload.items);
          saveStoredItems(payload.items);
        }
      } else if (payload.type === 'ITEM_TOGGLE') {
        setItems((prev) => {
          const updated = prev.map((item) =>
            item.id === payload.itemId
              ? {
                  ...item,
                  completed: payload.completed,
                  completedAt: payload.completed ? payload.updatedAt : undefined,
                  completedBy: payload.completed ? payload.completedBy : undefined,
                }
              : item
          );
          saveStoredItems(updated);
          return updated;
        });
      } else if (payload.type === 'ITEM_ADD') {
        setItems((prev) => {
          if (prev.some((i) => i.id === payload.item.id)) return prev;
          const updated = [payload.item, ...prev];
          saveStoredItems(updated);
          return updated;
        });
      } else if (payload.type === 'ITEM_UPDATE') {
        setItems((prev) => {
          const updated = prev.map((i) => (i.id === payload.item.id ? payload.item : i));
          saveStoredItems(updated);
          return updated;
        });
      } else if (payload.type === 'ITEM_DELETE') {
        setItems((prev) => {
          const updated = prev.filter((i) => i.id !== payload.itemId);
          saveStoredItems(updated);
          return updated;
        });
      } else if (payload.type === 'ITEMS_CLEAR_COMPLETED') {
        setItems((prev) => {
          const updated = prev.filter((i) => !(i.listId === payload.listId && i.completed));
          saveStoredItems(updated);
          return updated;
        });
      } else if (payload.type === 'LIST_UPDATE') {
        setLists((prev) => {
          const exists = prev.some((l) => l.id === payload.list.id);
          const updated = exists
            ? prev.map((l) => (l.id === payload.list.id ? payload.list : l))
            : [...prev, payload.list];
          saveStoredLists(updated);
          return updated;
        });
      }
    });

    return unsub;
  }, []);

  // Login success handler (receives verified user + sessionToken + cloud lists & items)
  const handleLoginSuccess = (data: {
    user: User;
    lists: ShoppingList[];
    items: ListItem[];
  }) => {
    setCurrentUser(data.user);
    saveStoredUser(data.user);

    const nextLists =
      data.lists && data.lists.length > 0 ? data.lists : [createDefaultUserList(data.user)];
    setLists(nextLists);
    saveStoredLists(nextLists);

    setItems(data.items || []);
    saveStoredItems(data.items || []);

    if (inviteListId && nextLists.some((l) => l.id === inviteListId)) {
      setActiveListId(inviteListId);
      try {
        sessionStorage.removeItem('listinha_pending_invite');
      } catch {}
    } else {
      setActiveListId(nextLists[0].id);
    }
  };

  // If user is not logged in, show the Login Screen Gate
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} inviteListId={inviteListId} />;
  }

  // Current list
  const currentList =
    lists.find((l) => l.id === activeListId) || lists[0] || createDefaultUserList(currentUser);

  // Current list items
  const currentListItems = items.filter((i) => i.listId === currentList.id);

  // Filtered items based on filter mode and search
  const filteredItems = currentListItems.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesCat = item.category.toLowerCase().includes(q);
      const matchesAssignee = item.assignedTo?.name.toLowerCase().includes(q);
      if (!matchesName && !matchesCat && !matchesAssignee) return false;
    }

    if (filterMode === 'pending') return !item.completed;
    if (filterMode === 'completed') return item.completed;
    if (filterMode === 'my_items') return item.assignedTo?.id === currentUser.id;

    return true;
  });

  // Items grouped by category
  const groupedCategories = CATEGORIES.map((cat) => {
    const catItems = filteredItems.filter((i) => i.category === cat.id);
    return {
      category: cat,
      items: catItems,
    };
  }).filter((g) => g.items.length > 0);

  // Completed items count in current list
  const completedCount = currentListItems.filter((i) => i.completed).length;

  // Toggle complete
  const handleToggleComplete = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const nextCompleted = !item.completed;
    const now = Date.now();

    const updatedItems = items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            completed: nextCompleted,
            completedAt: nextCompleted ? now : undefined,
            completedBy: nextCompleted ? { id: currentUser.id, name: currentUser.name } : undefined,
          }
        : i
    );

    setItems(updatedItems);
    saveStoredItems(updatedItems);

    realtime.broadcast({
      type: 'ITEM_TOGGLE',
      itemId,
      completed: nextCompleted,
      completedBy: { id: currentUser.id, name: currentUser.name },
      updatedAt: now,
    });

    if (nextCompleted) {
      const pendingBefore = currentListItems.filter((i) => !i.completed);
      if (pendingBefore.length === 1 && pendingBefore[0].id === itemId) {
        sound.playSuccess();
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0A84FF', '#30D158', '#BF5AF2', '#FFD60A'],
        });
      }
    }
  };

  // Add Item
  const handleAddItem = (data: Omit<ListItem, 'id' | 'createdAt' | 'completed' | 'listId'>) => {
    const newItem: ListItem = {
      ...data,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      listId: currentList.id,
      completed: false,
      createdAt: Date.now(),
    };

    const updated = [newItem, ...items];
    setItems(updated);
    saveStoredItems(updated);

    // Ensure the list itself also exists in cloud
    saveCloudList(currentList);

    realtime.broadcast({
      type: 'ITEM_ADD',
      item: newItem,
    });
  };

  // Update in-row quantity
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    sound.playStep();
    const updated = items.map((i) => {
      if (i.id !== itemId) return i;
      if (i.quantityType === 'unit') {
        const nextQ = Math.max(1, i.quantity + delta);
        return { ...i, quantity: nextQ };
      } else if (i.quantityType === 'weight') {
        const step = i.quantity >= 1000 ? 500 : 100;
        const nextQ = Math.max(100, i.quantity + delta * step);
        return {
          ...i,
          quantity: nextQ,
          unitLabel: nextQ >= 1000 ? 'kg' : 'g',
        };
      }
      return i;
    });

    setItems(updated);
    saveStoredItems(updated);

    const changedItem = updated.find((i) => i.id === itemId);
    if (changedItem) {
      realtime.broadcast({
        type: 'ITEM_UPDATE',
        item: changedItem,
      });
    }
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    saveStoredItems(updated);

    realtime.broadcast({
      type: 'ITEM_DELETE',
      itemId,
    });
  };

  // Assign item to participant
  const handleAssignItem = (itemId: string, participant: User | null) => {
    sound.playStep();
    const updated = items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            assignedTo: participant
              ? {
                  id: participant.id,
                  name: participant.name,
                  avatar: participant.avatar,
                  color: participant.color,
                }
              : undefined,
          }
        : i
    );
    setItems(updated);
    saveStoredItems(updated);

    const changedItem = updated.find((i) => i.id === itemId);
    if (changedItem) {
      realtime.broadcast({
        type: 'ITEM_UPDATE',
        item: changedItem,
      });
    }
  };

  // Clear completed items
  const handleClearCompleted = () => {
    const updated = items.filter((i) => !(i.listId === currentList.id && i.completed));
    setItems(updated);
    saveStoredItems(updated);

    realtime.broadcast({
      type: 'ITEMS_CLEAR_COMPLETED',
      listId: currentList.id,
    });
  };

  // Create new list
  const handleCreateList = (newList: ShoppingList) => {
    const updated = [...lists, newList];
    setLists(updated);
    saveStoredLists(updated);
    setActiveListId(newList.id);

    realtime.broadcast({
      type: 'LIST_UPDATE',
      list: newList,
    });
  };

  // Add family member by email -> sync list & items immediately so when they log in with that email, they see the list!
  const handleAddFamilyMember = (name: string, email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const newMember: User = {
      id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name,
      email: cleanEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=256&bold=true`,
      color: '#0A84FF',
    };

    const updatedLists = lists.map((l) => {
      if (l.id !== currentList.id) return l;
      const alreadyExists = l.collaborators.some(
        (c) => c.email.toLowerCase() === cleanEmail
      );
      const nextCollabs = alreadyExists ? l.collaborators : [...l.collaborators, newMember];
      return {
        ...l,
        collaborators: nextCollabs,
        eventDetails: l.eventDetails
          ? {
              ...l.eventDetails,
              participants: l.eventDetails.participants.some(
                (p) => p.email.toLowerCase() === cleanEmail
              )
                ? l.eventDetails.participants
                : [...l.eventDetails.participants, newMember],
            }
          : undefined,
      };
    });

    setLists(updatedLists);
    saveStoredLists(updatedLists);

    const updatedCurrent = updatedLists.find((l) => l.id === currentList.id);
    if (updatedCurrent) {
      realtime.broadcast({
        type: 'LIST_UPDATE',
        list: updatedCurrent,
        items: currentListItems,
      });
    }
  };

  // Open Share Modal -> force sync current list & items to cloud
  const handleOpenShare = () => {
    saveCloudList(currentList, currentListItems);
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090e] pb-28 text-slate-100 flex flex-col selection:bg-blue-600/30">
      {/* Liquid Glass Header */}
      <Header
        currentList={currentList}
        currentUser={currentUser}
        syncStatus={syncStatus}
        onOpenShare={handleOpenShare}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenNewList={() => setIsNewListModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto px-4 pt-3 flex-1">
        {/* List Selector Tabs */}
        <div className="mb-3">
          <ListTabs
            lists={lists}
            activeListId={currentList.id}
            onSelectList={setActiveListId}
            onOpenNewListModal={() => setIsNewListModalOpen(true)}
          />
        </div>

        {/* Temporary list banner if Happy Hour / Event */}
        {currentList.type === 'temporary' && currentList.eventDetails && (
          <div className="mb-4 p-3.5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl border border-purple-500/20 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎉</span>
              <div>
                <span className="text-xs font-bold text-purple-200 block">
                  Evento com Divisão de Tarefas
                </span>
                <span className="text-[11px] text-purple-300/80 block">
                  {currentList.eventDetails.date} • {currentList.eventDetails.location}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenShare}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-sm shadow-purple-600/30 flex items-center gap-1.5"
            >
              <Share2 className="w-3 h-3" />
              <span>Convidar</span>
            </button>
          </div>
        )}

        {/* Summary Stats & Progress Bar */}
        <SummaryStats
          list={currentList}
          totalItems={currentListItems.length}
          completedItems={completedCount}
          currentUser={currentUser}
          filterMode={filterMode}
          onFilterChange={setFilterMode}
          onClearCompleted={handleClearCompleted}
        />

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por item, categoria ou pessoa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/[0.07] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Grocery Items grouped by Category */}
        {groupedCategories.length > 0 ? (
          <div className="space-y-2">
            {groupedCategories.map(({ category, items }) => (
              <CategoryGroup
                key={category.id}
                category={category}
                items={items}
                list={currentList}
                currentUser={currentUser}
                onToggleComplete={handleToggleComplete}
                onUpdateQuantity={handleUpdateQuantity}
                onDelete={handleDeleteItem}
                onAssignItem={handleAssignItem}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/5 my-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
              🛒
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {searchQuery ? 'Nenhum item encontrado' : 'Sua lista está limpa e vazia'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              {searchQuery
                ? `Não encontramos resultados para "${searchQuery}". Tente outro termo.`
                : 'Toque no botão abaixo para adicionar os itens que você precisa comprar no supermercado.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => setIsAddSheetOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Adicionar Primeiro Item</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Apple Floating Action Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              sound.playStep();
              setIsAddSheetOpen(true);
            }}
            className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-blue-600/50 border border-white/20 backdrop-blur-xl active:scale-98 transition-all duration-200 group"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4 stroke-[3] text-white" />
            </div>
            <span>Adicionar à Lista</span>
            <span className="text-xs font-normal text-blue-200 ml-1 opacity-90 hidden sm:inline">
              (Unidades ou Quilos)
            </span>
          </button>
        </div>
      </div>

      {/* Add Item Bottom Sheet */}
      <AddItemSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAddItem={handleAddItem}
        currentList={currentList}
        currentUser={currentUser}
      />

      {/* Share Modal with QR Code and WhatsApp */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        list={currentList}
        items={currentListItems}
        currentUser={currentUser}
      />

      {/* Google Auth & User Management Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        currentList={currentList}
        onLogout={handleLogout}
        onAddFamilyMember={handleAddFamilyMember}
      />

      {/* New List Modal */}
      <NewListModal
        isOpen={isNewListModalOpen}
        onClose={() => setIsNewListModalOpen(false)}
        currentUser={currentUser}
        onCreateList={handleCreateList}
      />
    </div>
  );
};

export default App;
