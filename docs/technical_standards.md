# Technical Standards & Networking Protocol

## 1. Coding Standards
- **TypeScript Strict Mode**: Obrigatório em ambos (Client/Server).
- **Dry/Modular**: Componentes do Phaser e Handlers do Socket.IO devem ser isolados.
- **Naming**: camelCase para variáveis/funções, PascalCase para classes/interfaces.

## 2. Networking Protocol (Socket.IO)
Para otimizar o tráfego, usaremos um esquema de mensagens curto e padronizado.

### Message Types (JSON)
#### Client -> Server
- `USER_LOGIN`: `{ token: string, position?: { x: number, y: number } }`
- `USER_MOVE`: `{ x: number, y: number, dir: 'N'|'S'|'E'|'W' }`
- `USER_CHAT`: `{ message: string }`

#### Server -> Client
- `ROOM_STATE`: `{ players: { [id: string]: PlayerData } }`
- `PLAYER_JOINED`: `{ id: string, data: PlayerData }`
- `PLAYER_MOVED`: `{ id: string, x: number, y: number }`
- `CHAT_MESSAGE`: `{ id: string, message: string, timestamp: number }`

## 3. Room Management
As salas serão identificadas por IDs únicos no servidor.
- **Isolamento**: Jogadores em salas diferentes não recebem pacotes uns dos outros.
- **Grid-Based Movement**: As coordenadas serão baseadas em grid (ex: 32x32px) para simplificar a lógica de colisão no servidor.

## 4. Movement Strategy
- **Client-Side Prediction**: Opcional para MVP, mas recomendado para fluidez.
- **Server Reconciliation**: O servidor é a fonte da verdade. Se o movimento for inválido, o cliente é "teletransportado" de volta.
- **Linear Interpolation (Lerp)**: O cliente interpola posições recebidas do servidor para suavizar a renderização de outros jogadores.
