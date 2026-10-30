import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Settings,
  Mail,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
  X,
  ShieldCheck,
} from 'lucide-react';
import { ListItem, ShoppingList, User } from '../types';
import {
  getServerConfig,
  saveServerConfig,
  loginUser,
  registerUser,
  googleOAuthLogin,
} from '../services/api';
import { sound } from '../utils/audio';

interface LoginScreenProps {
  onLoginSuccess: (data: {
    user: User;
    lists: ShoppingList[];
    items: ListItem[];
  }) => void;
  inviteListId?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, inviteListId }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real Google OAuth Client ID state (stored on server)
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [showClientIdSetup, setShowClientIdSetup] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [savingClientId, setSavingClientId] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    // Clean up any legacy unverified device accounts
    try {
      localStorage.removeItem('listinha_real_device_accounts');
    } catch {}

    getServerConfig().then((cfg) => {
      if (cfg.google_client_id) {
        setGoogleClientId(cfg.google_client_id);
        setClientIdInput(cfg.google_client_id);
      }
    });
  }, []);

  // Real Google OAuth 2.0 Popup Flow verified server-side
  const handleRealGoogleOAuth = () => {
    setErrorMsg('');
    if (!googleClientId) {
      setShowClientIdSetup(true);
      return;
    }

    const googleObj = (window as any).google;
    if (!googleObj?.accounts?.oauth2) {
      setErrorMsg(
        'Aguardando carregamento do script oficial do Google. Tente novamente em instantes.'
      );
      return;
    }

    setIsGoogleLoading(true);
    try {
      const tokenClient = googleObj.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        prompt: 'select_account consent',
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            const authRes = await googleOAuthLogin(tokenResponse.access_token, inviteListId);
            if (authRes.success && authRes.user) {
              sound.playSuccess();
              onLoginSuccess({
                user: authRes.user,
                lists: authRes.lists || [],
                items: authRes.items || [],
              });
            } else {
              setErrorMsg(authRes.error || 'Falha ao autenticar com o Google.');
            }
          }
          setIsGoogleLoading(false);
        },
        error_callback: () => {
          setIsGoogleLoading(false);
        },
      });

      tokenClient.requestAccessToken();
    } catch {
      setIsGoogleLoading(false);
      setErrorMsg('Client ID do Google inválido ou domínio não autorizado no Google Cloud.');
    }
  };

  const handleSaveClientId = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = clientIdInput.trim();
    setSavingClientId(true);
    await saveServerConfig(cleaned);
    setGoogleClientId(cleaned);
    setSavingClientId(false);
    setShowClientIdSetup(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Digite um e-mail válido.');
      return;
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Digite seu nome.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Crie uma senha com pelo menos 6 caracteres para proteger sua conta.');
        return;
      }
      if (!acceptedTerms) {
        setErrorMsg('Marque a caixa aceitando os termos de sincronização.');
        return;
      }

      setIsSubmitting(true);
      const res = await registerUser(name.trim(), cleanEmail, password, inviteListId);
      setIsSubmitting(false);

      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Não foi possível criar a conta.');
        return;
      }

      sound.playSuccess();
      onLoginSuccess({
        user: res.user,
        lists: res.lists || [],
        items: res.items || [],
      });
    } else {
      if (!password) {
        setErrorMsg('Digite sua senha para entrar.');
        return;
      }

      setIsSubmitting(true);
      const res = await loginUser(cleanEmail, password, inviteListId);
      setIsSubmitting(false);

      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'E-mail ou senha inválidos.');
        return;
      }

      sound.playSuccess();
      onLoginSuccess({
        user: res.user,
        lists: res.lists || [],
        items: res.items || [],
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 py-8 selection:bg-blue-600/30">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-3.5 shadow-2xl shadow-blue-500/30 flex items-center justify-center mx-auto border border-white/20">
              <span className="text-3xl">🛒</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#07090e] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">Listinha</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xs mx-auto">
            {inviteListId
              ? 'Você recebeu um convite para acessar uma lista compartilhada em tempo real!'
              : 'Sua lista de supermercado compartilhada em tempo real.'}
          </p>
        </div>

        {/* Main Login Glass Card */}
        <div className="glass-panel rounded-3xl p-6 border border-white/15 shadow-2xl space-y-5">
          {/* Segmented Control: Entrar vs Criar Conta */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/50 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {/* Authenticated Form (Password Protected) */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Seu Nome:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Digite seu nome real"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Seu E-mail:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {authMode === 'register'
                  ? 'Crie uma Senha (mínimo 6 caracteres):'
                  : 'Sua Senha:'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={authMode === 'register' ? 6 : 1}
                  placeholder={
                    authMode === 'register' ? 'Mínimo de 6 caracteres' : 'Digite sua senha'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Explicit Consent Checkbox on Registration */}
            {authMode === 'register' && (
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition-colors">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Aceito e concordo</strong> em proteger minha conta com senha e sincronizar minhas listas em tempo real com os membros autorizados.
                </span>
              </label>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 text-center font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              <span>
                {isSubmitting
                  ? 'Verificando...'
                  : authMode === 'register'
                  ? 'Criar Conta Segura e Entrar'
                  : 'Entrar com E-mail e Senha'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-2 px-3">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Conta protegida com criptografia Bcrypt + Token de Sessão</span>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">
              ou OAuth Oficial
            </span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          {/* Official Google OAuth 2.0 Popup Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleRealGoogleOAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 active:scale-98 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {isGoogleLoading
                  ? 'Abrindo janela do Google...'
                  : 'Entrar com Popup Oficial do Google'}
              </span>
            </button>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowClientIdSetup(true)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Settings className="w-3 h-3" />
                <span>
                  {googleClientId
                    ? 'Client ID Google OAuth configurado'
                    : 'Configurar Client ID Google Cloud OAuth'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal to configure real Google OAuth Client ID */}
      {showClientIdSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#10141f] border border-white/20 rounded-3xl p-6 shadow-2xl animate-pop-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white">
                Configurar Login Oficial do Google (OAuth 2.0)
              </h3>
              <button
                type="button"
                onClick={() => setShowClientIdSetup(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Para que o Google abra a janela real do <strong>accounts.google.com</strong> listando as contas Gmail logadas no navegador, o Google exige um <strong>OAuth Client ID</strong> vinculado ao domínio:
            </p>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 space-y-1.5 mb-4">
              <div>
                1. Acesse{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline inline-flex items-center gap-0.5"
                >
                  Google Cloud Credentials <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div>
                2. Crie um <strong>ID do cliente OAuth (Aplicativo da Web)</strong>
              </div>
              <div>
                3. Em <strong>Origens JavaScript autorizadas</strong>, adicione:{' '}
                <code className="text-emerald-400 bg-black/40 px-1.5 py-0.5 rounded">
                  https://listinha.landingprofile.com
                </code>
              </div>
            </div>

            <form onSubmit={handleSaveClientId} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Cole seu Google Client ID:
                </label>
                <input
                  type="text"
                  placeholder="Ex: 123456789-abc.apps.googleusercontent.com"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowClientIdSetup(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-medium text-slate-300"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={savingClientId}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
                >
                  {savingClientId ? 'Salvando...' : 'Salvar no Servidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
