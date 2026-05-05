# Technical Standards & Networking Protocol

## 1. Coding Standards
- **TypeScript Strict Mode**: Obrigatório em ambos (Client/Server).
- **Dry/Modular**: Componentes do Phaser e Handlers do Socket.IO devem ser isolados.
- **Naming**: camelCase para variáveis/funções, PascalCase para classes/interfaces.

## 2. Networking Protocol (Socket.IO) - v1.1 (Color Sync)
Para maximizar a performance e incluir personalização básica.

### Message Types (JSON)
#### Client -> Server
- `l` (Login): `{ n: string }`
- `m` (Move): `{ x: number, y: number, d: number }` (d: 0=N, 1=S, 2=E, 3=W)
- `c` (Chat): `{ m: string }`

#### Server -> Client
- `s` (State): `{ p: { [id: string]: { n: string, x: number, y: number, d: number, c: number } } }`
- `j` (Join): `{ id: string, n: string, x: number, y: number, c: number }`
- `q` (Quit): `{ id: string }`
- `m` (Moved): `{ id: string, x: number, y: number, d: number }`
- `c` (Chat): `{ id: string, m: string }`

## 3. Room Management
- **Lobby Default**: Todo novo usuário é alocado na sala `room_lobby`.
- **Isolamento**: Filtro de broadcast por `RoomID`.

## 4. UI & Chat Strategy
- **HTML/DOM Overlays**: Balões de chat renderizados via HTML para aproveitar flexibilidade do CSS.
- **Sincronia**: Posicionamento atualizado via `Phaser.GameObjects.Components.Transform` mapeado para `window` coordinates.
