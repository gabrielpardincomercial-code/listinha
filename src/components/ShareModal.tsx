import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Share2, MessageCircle, Users, ExternalLink, QrCode } from 'lucide-react';
import { ListItem, ShoppingList, User } from '../types';
import { formatQuantityDisplay } from '../utils/categories';
import { sound } from '../utils/audio';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingList;
  items: ListItem[];
  currentUser: User;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  list,
  items,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?list=${list.id}`
    : `https://listinha.landingprofile.com/?list=${list.id}`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(shareUrl, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#ffffff',
          light: '#090b10',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    sound.playStep();
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    sound.playStep();
    const pendingItems = items.filter((i) => !i.completed);
    let text = `🛒 *Listinha de Compras: ${list.title}*\n\n`;
    if (pendingItems.length > 0) {
      text += `*Itens a comprar (${pendingItems.length}):*\n`;
      pendingItems.forEach((i) => {
        text += `• ${i.name} (${formatQuantityDisplay(i)})${i.assignedTo ? ` - [${i.assignedTo.name.split(' ')[0]}]` : ''}\n`;
      });
    } else {
      text += `Todos os itens foram concluídos! 🎉\n`;
    }
    text += `\n📱 *Acompanhe e marque em tempo real:* ${shareUrl}`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
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
            <span className="text-xl">📲</span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Compartilhar Lista
              </h2>
              <p className="text-xs text-slate-400">
                Sincroniza em tempo real entre celulares
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-2xl border border-white/10 mb-4">
          {qrDataUrl ? (
            <div className="p-2.5 bg-[#090b10] rounded-2xl border border-white/10 shadow-lg">
              <img
                src={qrDataUrl}
                alt="QR Code da Lista"
                className="w-44 h-44 rounded-xl"
              />
            </div>
          ) : (
            <div className="w-44 h-44 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
              Gerando QR Code...
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Aponte a câmera do iPhone ou Android do cônjuge/amigo para abrir instantaneamente.
          </p>
        </div>

        {/* Share Actions */}
        <div className="space-y-2.5 mb-5">
          {/* WhatsApp Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-98 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-blue-400" />
                <span>Copiar Link de Acesso</span>
              </>
            )}
          </button>
        </div>

        {/* Collaborators list */}
        <div className="pt-3 border-t border-white/10">
          <span className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Pessoas conectadas a esta lista ({list.collaborators.length}):
          </span>
          <div className="space-y-2">
            {list.collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={collab.avatar}
                    alt={collab.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                  />
                  <div>
                    <span className="text-xs font-medium text-slate-200 block leading-tight">
                      {collab.name} {collab.id === currentUser.id && '(Você)'}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {collab.email}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  Sincronizado
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
