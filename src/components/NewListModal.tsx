import React, { useState } from 'react';
import { X, Plus, Users } from 'lucide-react';
import { ListType, ShoppingList, User } from '../types';
import { sound } from '../utils/audio';

interface NewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreateList: (newList: ShoppingList) => void;
}

const EMOJI_OPTIONS = ['🏠', '🍻', '🥩', '🛒', '🎉', '🏖️', '🍕', '🍰', '🎄', '🏕️'];

export const NewListModal: React.FC<NewListModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateList,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ListType>('family');
  const [emoji, setEmoji] = useState('🏠');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [extraParticipants, setExtraParticipants] = useState<Array<{ name: string; email: string }>>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonEmail, setNewPersonEmail] = useState('');

  if (!isOpen) return null;

  const handleAddParticipant = () => {
    if (!newPersonName.trim()) return;
    setExtraParticipants((prev) => [
      ...prev,
      {
        name: newPersonName.trim(),
        email: newPersonEmail.trim().toLowerCase(),
      },
    ]);
    setNewPersonName('');
    setNewPersonEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playStep();

    const participants: User[] = [
      currentUser,
      ...extraParticipants.map((p, idx) => ({
        id: `usr_custom_${idx}_${Date.now()}`,
        name: p.name,
        email: p.email || `${p.name.toLowerCase().replace(/\s+/g, '')}@listinha.local`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff&size=256&bold=true`,
        color: ['#FF2D55', '#30D158', '#BF5AF2', '#FF9500'][idx % 4],
      })),
    ];

    const newList: ShoppingList = {
      id: `list_${Date.now()}`,
      title: title.trim(),
      type,
      emoji,
      description:
        description.trim() || (type === 'family' ? 'Lista compartilhada' : 'Evento temporário'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ownerId: currentUser.id,
      collaborators: participants,
      eventDetails:
        type === 'temporary'
          ? {
              date: eventDate.trim() || 'Data a definir',
              location: eventLocation.trim() || 'A combinar',
              participants,
            }
          : undefined,
    };

    onCreateList(newList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0e131f] border border-white/15 rounded-3xl p-6 shadow-2xl shadow-black/90 max-h-[90vh] overflow-y-auto animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="text-base font-bold text-white tracking-tight">Criar Nova Lista</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* List Type Segmented Switch */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Tipo de Lista
            </label>
            <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  sound.playStep();
                  setType('family');
                  setEmoji('🏠');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  type === 'family'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🏠 Lista da Família
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playStep();
                  setType('temporary');
                  setEmoji('🍻');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  type === 'temporary'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🍻 Temporária (Happy Hour)
              </button>
            </div>
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Ícone</label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    sound.playStep();
                    setEmoji(e);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    emoji === e
                      ? 'bg-blue-600/30 border-2 border-blue-500 scale-105'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* List Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Nome da Lista
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={
                type === 'family'
                  ? 'Ex: Compras da Semana, Feira...'
                  : 'Ex: Happy Hour, Churrasco de Domingo...'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
            />
          </div>

          {/* Event Details if Temporary */}
          {type === 'temporary' && (
            <div className="space-y-3 p-3.5 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <span className="text-xs font-bold text-purple-300 block flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Detalhes do Evento (Happy Hour / Churrasco):
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Quando vai ser?</label>
                <input
                  type="text"
                  placeholder="Ex: Sexta-feira às 19:30"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Local:</label>
                <input
                  type="text"
                  placeholder="Ex: Área Gourmet"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Add Friends/Participants */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Adicionar participantes (nome e e-mail opcional):
                </label>
                <div className="space-y-1.5 mb-2">
                  <input
                    type="text"
                    placeholder="Nome do participante"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      placeholder="E-mail (para sincronizar no celular dele)"
                      value={newPersonEmail}
                      onChange={(e) => setNewPersonEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddParticipant();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddParticipant}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                    >
                      + Incluir
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white/10 text-slate-200">
                    {currentUser.name.split(' ')[0]} (Você)
                  </span>
                  {extraParticipants.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/30 flex items-center gap-1"
                    >
                      <span>{p.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setExtraParticipants(extraParticipants.filter((_, i) => i !== idx))
                        }
                        className="text-purple-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
                title.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Criar Lista</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
