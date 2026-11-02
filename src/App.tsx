import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Search, Share2, Layers, ListOrdered } from 'lucide-react';
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
import { verifyUserSession, saveCloudList, deleteCloudList } from './services/api';
import { CATEGORIES, detectSmartCategory } from './utils/categories';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { ListTabs } from './components/ListTabs';
import { SummaryStats } from './components/SummaryStats';
import { CategoryGroup } from './components/CategoryGroup';
import { ItemRow } from './components/ItemRow';
import { AddItemSheet } from './components/AddItemSheet';
import { ShareModal } from './components/ShareModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { NewListModal } from './components/NewListModal';
import { LoginScreen } from './components/LoginScreen';
import { BrandLogo } from './components/BrandLogo';

export const App: React.FC = () => {
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

  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser);

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

  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed' | 'my_items'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'order' | 'categories'>('categories');
  const [isAddingMode, setIsAddingMode] = useState(false);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);

  // Track exact visualViewport height & offsetTop so the app shell stays locked to the screen above the keyboard (WhatsApp-style, zero jiggle on scroll)
  const [viewportBox, setViewportBox] = useState<{
    top: number;
    height: number | null;
    isKeyboardOpen: boolean;
  }>({
    top: 0,
    height: null,
    isKeyboardOpen: false,
  });
  const mainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const syncViewport = () => {
      const kbOpen = window.innerHeight - vv.height > 110;
      setViewportBox({
        top: Math.max(0, Math.round(vv.offsetTop)),
        height: Math.round(vv.height),
        isKeyboardOpen: kbOpen,
      });
    };
    vv.addEventListener('resize', syncViewport);
    vv.addEventListener('scroll', syncViewport);
    syncViewport();
    return () => {
      vv.removeEventListener('resize', syncViewport);
      vv.removeEventListener('scroll', syncViewport);
    };
  }, []);

  useEffect(() => {
    const unsub = realtime.onStatusChange(setSyncStatus);
    return unsub;
  }, []);

  useEffect(() => {
    if (activeListId && currentUser) {
      realtime.setContext(activeListId, currentUser);
    } else {
      realtime.stopPolling();
    }
  }, [activeListId, currentUser]);

  const handleLogout = () => {
    realtime.stopPolling();
    logoutAndClearSession();
    setCurrentUser(null);
    setLists([]);
    setItems([]);
    setActiveListId('');
  };

  useEffect(() => {
    if (currentUser) {
      verifyUserSession(currentUser, inviteListId).then((res) => {
        if (!res.valid) {
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
      } else if (payload.type === 'LIST_DELETE') {
        setLists((prev) => {
          const remaining = prev.filter((l) => l.id !== payload.listId);
          saveStoredLists(remaining);
          return remaining;
        });
        setItems((prev) => {
          const remainingItems = prev.filter((i) => i.listId !== payload.listId);
          saveStoredItems(remainingItems);
          return remainingItems;
        });
      }
    });

    return unsub;
  }, []);

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

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} inviteListId={inviteListId} />;
  }

  const currentList =
    lists.find((l) => l.id === activeListId) || lists[0] || createDefaultUserList(currentUser);

  const currentListItems = items
    .filter((i) => i.listId === currentList.id)
    .map((item) => {
      if (item.category === 'mercearia') {
        const smartCat = detectSmartCategory(item.name).category;
        if (smartCat !== 'mercearia') {
          return { ...item, category: smartCat };
        }
      }
      return item;
    });

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

  const groupedCategories = CATEGORIES.map((cat) => {
    const catItems = filteredItems.filter((i) => i.category === cat.id);
    return {
      category: cat,
      items: catItems,
    };
  }).filter((g) => g.items.length > 0);

  const orderedItems = [...filteredItems].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const completedCount = currentListItems.filter((i) => i.completed).length;

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

    setViewMode('order');
    saveCloudList(currentList);

    realtime.broadcast({
      type: 'ITEM_ADD',
      item: newItem,
    });

    // Keep top of list visible when adding new items
    requestAnimationFrame(() => {
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

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

  const handleDeleteItem = (itemId: string) => {
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    saveStoredItems(updated);

    realtime.broadcast({
      type: 'ITEM_DELETE',
      itemId,
    });
  };

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

  const handleClearCompleted = () => {
    const updated = items.filter((i) => !(i.listId === currentList.id && i.completed));
    setItems(updated);
    saveStoredItems(updated);

    realtime.broadcast({
      type: 'ITEMS_CLEAR_COMPLETED',
      listId: currentList.id,
    });
  };

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

  const handleDeleteList = (listIdToDelete: string) => {
    const remainingItems = items.filter((i) => i.listId !== listIdToDelete);
    setItems(remainingItems);
    saveStoredItems(remainingItems);

    const remainingLists = lists.filter((l) => l.id !== listIdToDelete);
    deleteCloudList(listIdToDelete);

    realtime.broadcast({
      type: 'LIST_DELETE',
      listId: listIdToDelete,
    });

    if (remainingLists.length > 0) {
      setLists(remainingLists);
      saveStoredLists(remainingLists);
      if (activeListId === listIdToDelete) {
        setActiveListId(remainingLists[0].id);
      }
    } else {
      const freshList: ShoppingList = {
        ...createDefaultUserList(currentUser),
        id: `list_familia_${currentUser.id}_${Date.now()}`,
      };
      setLists([freshList]);
      saveStoredLists([freshList]);
      setActiveListId(freshList.id);
      saveCloudList(freshList, []);
    }
  };

  const handleAddingModeChange = (adding: boolean) => {
    setIsAddingMode(adding);
    if (adding) {
      setViewMode('order');
    } else {
      setViewMode('categories');
    }
  };

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

  const handleOpenShare = () => {
    saveCloudList(currentList, currentListItems);
    setIsShareModalOpen(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: `${viewportBox.top}px`,
        left: 0,
        right: 0,
        height: viewportBox.height ? `${viewportBox.height}px` : '100dvh',
      }}
      className="bg-[#07090e] text-slate-100 flex flex-col overflow-hidden selection:bg-blue-600/30"
    >
      {/* Top Fixed Header */}
      <Header
        currentList={currentList}
        currentUser={currentUser}
        syncStatus={syncStatus}
        onOpenShare={handleOpenShare}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenNewList={() => setIsNewListModalOpen(true)}
      />

      {/* Middle Scrollable Container (scrolling here NEVER moves the bottom bar!) */}
      <main
        ref={mainScrollRef}
        className="max-w-3xl w-full mx-auto px-3.5 pt-2.5 pb-6 flex-1 overflow-y-auto overscroll-contain"
      >
        {/* List Selector Tabs + Delete List button */}
        <div className="mb-2.5">
          <ListTabs
            lists={lists}
            activeListId={currentList.id}
            onSelectList={setActiveListId}
            onOpenNewListModal={() => setIsNewListModalOpen(true)}
            onDeleteList={handleDeleteList}
          />
        </div>

        {/* Hide bulky banners while actively typing so newly added items stay right at the top */}
        {!isAddingMode && (
          <>
            {currentList.type === 'temporary' && currentList.eventDetails && (
              <div className="mb-3 p-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl border border-purple-500/20 backdrop-blur-md flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl flex-shrink-0">🎉</span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-purple-200 block truncate">
                      Evento com Divisão de Tarefas
                    </span>
                    <span className="text-[11px] text-purple-300/80 block truncate">
                      {currentList.eventDetails.date} • {currentList.eventDetails.location}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenShare}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Convidar</span>
                </button>
              </div>
            )}

            <SummaryStats
              list={currentList}
              totalItems={currentListItems.length}
              completedItems={completedCount}
              currentUser={currentUser}
              filterMode={filterMode}
              onFilterChange={setFilterMode}
              onClearCompleted={handleClearCompleted}
            />

            {isSearchOpen ? (
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-16 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-2 text-xs text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>
            ) : (
              currentListItems.length > 3 && (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full mb-3 px-3.5 py-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-xs text-slate-400 flex items-center gap-2 transition-all"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Buscar item na lista...</span>
                </button>
              )
            )}
          </>
        )}

        {/* Clean 2-Button Segmented Switch: Ordem de Adição vs Por Categoria */}
        {currentListItems.length > 0 && (
          <div className="grid grid-cols-2 gap-1 p-1 mb-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <button
              type="button"
              onClick={() => {
                sound.playStep();
                setViewMode('order');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                viewMode === 'order'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Ordem de Adição</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playStep();
                setViewMode('categories');
                setIsAddingMode(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                viewMode === 'categories'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Por Categoria</span>
            </button>
          </div>
        )}

        {/* Grocery Items */}
        {filteredItems.length > 0 ? (
          viewMode === 'order' ? (
            <div className="space-y-2">
              {orderedItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
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
          )
        ) : (
          <div className="py-10 px-4 text-center rounded-3xl bg-white/[0.02] border border-white/5 my-3">
            <div className="mx-auto flex items-center justify-center mb-3">
              <BrandLogo size="md" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1">
              {searchQuery ? 'Nenhum item encontrado' : 'Sua lista está limpa e vazia'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
              {searchQuery
                ? `Não encontramos resultados para "${searchQuery}".`
                : 'Digite o item na barra abaixo, ajuste a quantidade e toque na setinha para enviar!'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => setIsAddSheetOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Começar a Digitar</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Bottom Docked WhatsApp Bar (glued to bottom / keyboard, never moves on scroll) */}
      <AddItemSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAddItem={handleAddItem}
        currentList={currentList}
        currentUser={currentUser}
        onAddingModeChange={handleAddingModeChange}
        isKeyboardOpen={viewportBox.isKeyboardOpen}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        list={currentList}
        items={currentListItems}
        currentUser={currentUser}
      />

      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        currentList={currentList}
        onLogout={handleLogout}
        onAddFamilyMember={handleAddFamilyMember}
      />

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
