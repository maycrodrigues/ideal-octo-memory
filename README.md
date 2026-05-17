# ObserviKids

Aplicação SaaS moderna (Offline-First) para gerenciar as atividades e observações diárias de crianças (Mariana e Miguel), com suporte a localização, fotos e relatórios consolidados.

## 🚀 Tecnologias

- **Frontend:** React 19, TypeScript, Vite
- **Estilização:** Tailwind CSS 4
- **Gerenciamento de Estado:** Zustand (Estado Global) e TanStack Query (Sincronização e Cache)
- **Mapas e Localização:** React Leaflet
- **Validação de Dados:** Zod
- **Armazenamento Offline:** IndexedDB (Wrapper via `idb`)
- **Utilitários:** Lucide React (Ícones), date-fns/ulid

## 🏗️ Arquitetura e Padrões

O projeto segue uma arquitetura modular focada em escalabilidade, performance e funcionamento offline-first:

- **Modularidade por Feature:** Código organizado em `/src/features`, separando lógica de negócio da apresentação.
- **Offline-First:** Uso de IndexedDB como fonte de verdade primária, com estratégias de cache robustas para garantir que o app funcione sem conexão à internet.
- **Hooks Customizados:** Lógica encapsulada em hooks (`useLogger`, `useTenant`, `useOfflineStatus`, etc.).
- **Acessibilidade e SEO:** HTML semântico seguindo normas W3C/WHATWG, com tags `<meta>` apropriadas e componentes acessíveis.

## 💻 Executando Localmente

**Pré-requisitos:** Node.js 20+

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Execute o app em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Para gerar a build de produção:
   ```bash
   npm run build
   ```

## 🌐 Deploy

O projeto está configurado para ser implantado automaticamente no **GitHub Pages** através de GitHub Actions sempre que um push é feito na branch `main`.
