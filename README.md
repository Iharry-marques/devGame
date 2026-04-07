# Social Universe Prototype

Protótipo funcional de um universo social multiplayer 2D no navegador, construído em TypeScript com monorepo, portal web em Next.js, cliente do jogo em Phaser 3 e servidor em Colyseus.

## Arquitetura

O monorepo é dividido em quatro áreas:

- `apps/web`: portal de entrada do usuário. Coleta nome e avatar, persiste a sessão local e redireciona para o cliente do jogo.
- `apps/game`: cliente Phaser 3. Renderiza mapa, jogadores, câmera e chat. Toda a rede fica isolada em `NetworkManager`.
- `apps/server`: servidor Colyseus. Mantém a sala `lobby`, processa entrada e saída de jogadores, valida mensagens e sincroniza estado.
- `packages/shared`: tipos, enums, constantes e contratos compartilhados entre todas as aplicações.

Essa separação deixa o protótipo pronto para evoluir para autenticação real, persistência em PostgreSQL, Redis para escala, múltiplas salas e serviços externos como tradução de chat.

## Árvore de arquivos

```text
.
├── apps
│   ├── game
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── config
│   │   │   │   └── env.ts
│   │   │   ├── game
│   │   │   │   ├── entities
│   │   │   │   │   └── PlayerAvatar.ts
│   │   │   │   └── GameScene.ts
│   │   │   ├── network
│   │   │   │   └── NetworkManager.ts
│   │   │   ├── ui
│   │   │   │   └── ChatOverlay.ts
│   │   │   ├── main.ts
│   │   │   └── styles.css
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   ├── server
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── config
│   │   │   │   └── env.ts
│   │   │   ├── domain
│   │   │   │   └── player.ts
│   │   │   ├── rooms
│   │   │   │   ├── handlers
│   │   │   │   │   ├── chat.ts
│   │   │   │   │   └── movement.ts
│   │   │   │   ├── schema
│   │   │   │   │   ├── LobbyRoomState.ts
│   │   │   │   │   └── PlayerState.ts
│   │   │   │   └── LobbyRoom.ts
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   └── web
│       ├── app
│       │   ├── game
│       │   │   ├── _components
│       │   │   │   └── GameRedirect.tsx
│       │   │   └── page.tsx
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── components
│       │   ├── AvatarPicker.tsx
│       │   └── PortalEntryForm.tsx
│       ├── lib
│       │   └── session.ts
│       ├── next-env.d.ts
│       ├── next.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── packages
│   └── shared
│       ├── package.json
│       ├── src
│       │   ├── chat
│       │   │   └── chat.ts
│       │   ├── config
│       │   │   └── constants.ts
│       │   ├── player
│       │   │   ├── avatar.ts
│       │   │   └── player.ts
│       │   ├── protocol
│       │   │   ├── events.ts
│       │   │   └── messages.ts
│       │   ├── session
│       │   │   └── session.ts
│       │   └── index.ts
│       └── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Fluxo do protótipo

1. O usuário abre `apps/web`.
2. Informa nome e escolhe um avatar.
3. O portal grava a sessão no `localStorage` e redireciona para `/game`.
4. A rota `/game` do portal transfere nome e avatar para `apps/game` por query string.
5. O cliente Phaser conecta ao servidor Colyseus na sala `lobby`.
6. O servidor passa a sincronizar o estado autoritativo dos jogadores.
7. Os clientes veem movimentação em tempo real e enviam mensagens pelo chat.

## Portas padrão

- `web`: `3000`
- `game`: `3001`
- `server`: `2567`

## Como instalar

```bash
pnpm install
```

Alternativa com npm:

```bash
npm install
```

## Como rodar cada app

Servidor multiplayer:

```bash
pnpm dev:server
```

Cliente Phaser:

```bash
pnpm dev:game
```

Portal Next.js:

```bash
pnpm dev:web
```

Alternativas com npm:

```bash
npm run dev --workspace @social-universe/server
npm run dev --workspace @social-universe/game
npm run dev --workspace @social-universe/web
```

## Variáveis opcionais

`apps/web`

- `NEXT_PUBLIC_GAME_URL`: URL do cliente Phaser. Padrão: `http://localhost:3001`

`apps/game`

- `VITE_SERVER_URL`: URL do servidor Colyseus. Padrão: `ws://localhost:2567`
- `VITE_WEB_URL`: URL do portal. Padrão: `http://localhost:3000`

`apps/server`

- `PORT`: porta HTTP/WebSocket do Colyseus. Padrão: `2567`

## Próximas extensões previstas

- autenticação real antes do `join` da sala
- persistência de perfis e inventário com PostgreSQL
- Redis para presença distribuída e múltiplas instâncias
- catálogo de salas além do `lobby`
- sistema de amigos e presença social
- pipeline assíncrono de tradução automática por mensagem
