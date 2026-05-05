# Social Game — Sala Virtual Multiplayer

Protótipo de jogo social online com visão top-down, chat em tempo real e sincronização de movimentação entre múltiplos jogadores.

## Stack

| Camada   | Tecnologia                    |
|----------|-------------------------------|
| Frontend | Vite + TypeScript + Phaser 3  |
| Backend  | Node.js + Express + Socket.io |
| Monorepo | npm workspaces + concurrently  |

## Estrutura de Pastas

```
social-game/
├── package.json          # Script raiz com concurrently
├── client/
│   ├── index.html
│   ├── src/
│   │   ├── main.ts       # Entry point + Login UI + Chat HTML
│   │   ├── socket.ts     # Singleton de conexão Socket.io
│   │   ├── game/
│   │   │   ├── GameScene.ts   # Cena principal do Phaser
│   │   │   └── Player.ts      # Avatar local e remoto (lerp + balões)
│   │   └── styles/global.css
└── server/
    ├── src/
    │   ├── index.ts       # Servidor Express + Socket.io
    │   ├── RoomManager.ts # Estado em memória
    │   └── types.ts       # Interfaces compartilhadas
```

## Como Rodar

### Pré-requisitos
- Node.js >= 18

### 1. Instalar dependências

```bash
# Na raiz do projeto
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Rodar em desenvolvimento (ambos juntos)

```bash
npm run dev
```

Isso inicia:
- **Servidor** em `http://localhost:3000`
- **Cliente** em `http://localhost:5173`

### 3. Rodar separadamente

```bash
# Terminal 1 — servidor
cd server && npm run dev

# Terminal 2 — cliente
cd client && npm run dev
```

## Testando o Multiplayer

1. Abra `http://localhost:5173` em uma aba normal
2. Abra `http://localhost:5173` em uma **aba anônima**
3. Entre com nomes diferentes em cada aba

### Critérios de Sucesso

| Funcionalidade | Como Verificar |
|---|---|
| Conexão simultânea | Dois avatares aparecendo em ambas as telas |
| Sincronia de movimento | Clicar em uma tela move o avatar em ambas |
| Balão de chat | Digitar no chat mostra balão acima do avatar no mundo |
| Histórico de chat | Mensagens aparecem no painel lateral |
| Cleanup | Fechar uma aba remove o avatar imediatamente |

## Eventos Socket.io

| Evento (cliente → servidor) | Descrição |
|---|---|
| `player:join` | Entra na sala com um nome |
| `player:move` | Envia nova posição `{x, y}` |
| `chat:message` | Envia texto de chat (max 100 chars) |

| Evento (servidor → cliente) | Descrição |
|---|---|
| `room:state` | Estado completo (apenas para o novo jogador) |
| `player:joined` | Novo jogador para os outros |
| `player:moved` | Posição atualizada (broadcast) |
| `chat:message` | Mensagem de chat com autor e timestamp |
| `player:left` | ID do jogador que saiu |
