# 🛒 Listinha • Supermercado Colaborativo em Tempo Real

> Web App com visual inspirado na Apple (Liquid Glass), preparado estrategicamente para publicação nativa no **iOS** e **Android** via **Capacitor / PWA**.

🔗 **URL de Produção**: [https://listinha.landingprofile.com](https://listinha.landingprofile.com)

---

## 📱 Estratégia Mobile-First (iOS & Android)

O projeto foi arquitetado do zero pensando no lançamento nas lojas **App Store** (Apple) e **Google Play** (Android):
1. **PWA Standalone & Safe Areas**:
   - `viewport-fit=cover` com variáveis CSS `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)` para suporte nativo ao Dynamic Island e notch do iPhone.
   - Ícones maskable e Apple Touch Icon em alta resolução.
   - Feedback tátil (`navigator.vibrate`) e sonoro sintetizado em tempo real (Web Audio API) idêntico aos micro-sons do iOS.
2. **Capacitor 7.0 Configurado**:
   - Arquivo `capacitor.config.ts` pronto com App ID `com.landingprofile.listinha`.
   - Comandos diretos:
     ```bash
     npm run build
     npx cap add ios
     npx cap add android
     npm run cap:sync
     npm run cap:ios     # Abre o Xcode
     npm run cap:android # Abre o Android Studio
     ```

---

## ✨ Funcionalidades Principais

1. **Conta Google & Compartilhamento Familiar**:
   - Login com conta Google integrado (Google Identity Services / OAuth 2.0).
   - Compartilhamento instantâneo via **QR Code**, link copiável ou envio direto formatado no **WhatsApp**.
   - Colaboração entre cônjuge, filhos e amigos com avatares visíveis.

2. **Atualização em Tempo Real com Check**:
   - Marque com check conforme vai pegando os itens no mercado e todos os envolvidos vêem a lista riscar e atualizar instantaneamente.
   - Som Apple de checkmark e celebração com confetes ao finalizar 100% da lista!

3. **Organização por Categorias do Supermercado**:
   - 🥬 **Hortifrúti** (Frutas, Legumes, Verduras)
   - 🥩 **Açougue & Carnes**
   - 🥛 **Laticínios & Frios**
   - 🥖 **Padaria & Confeitaria**
   - 🥫 **Mercearia & Despensa**
   - 🍺 **Bebidas & Adega**
   - 🧼 **Limpeza da Casa**
   - 🧴 **Higiene & Beleza**
   - ❄️ **Congelados**
   - 🐾 **Pet Shop**
   - 💡 **Outros**
   - *Detecção inteligente automática*: ao digitar "banana", "picanha", "cerveja" ou "detergente", o app já seleciona a categoria certa e a unidade padrão.

4. **Controle Preciso de Quantidades (Unidades e Peso)**:
   - **Itens Unitários**: Pré-configurado em `1`, com botões `+` e `-` para adicionar ou retirar com rapidez.
   - **Itens em Quilo/Gramas**: Inicia em `100g`, com chips rápidos de `100g`, `500g`, `1kg`, ou campo de digitação livre para medidas personalizadas, além de `+` e `-` que percorrem os intervalos.
   - **Modo Personalizado**: Campo livre para medidas como `3 caixas`, `2 garrafas`, etc.

5. **Listas Temporárias (Happy Hour / Churrasco / Eventos)**:
   - Alterne com facilidade entre a **Lista da Família** e **Listas Temporárias**.
   - **Designação de Itens**: Defina quem vai levar ou comprar cada item ("Gabriel leva a cerveja", "Lucas leva a picanha", "Camila leva o carvão").
   - Filtro "Designados a mim" para focar apenas no que você precisa comprar.

6. **Design Apple Liquid Glass**:
   - Efeito Glassmorphism com `backdrop-filter: blur(20px)`, bordas translúcidas, sombras suaves e tipografia moderna SF Pro.

---

## 🛠️ Tecnologias Utilizadas

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** com extensões de Glassmorphism
- **Lucide Icons**
- **Canvas Confetti**
- **Web Audio API** (Sons nativos sintetizados)
- **Capacitor 7.0** (Preparação iOS e Android)
- **Hostinger Cloud Hosting** (Subdomínio `listinha.landingprofile.com`)
