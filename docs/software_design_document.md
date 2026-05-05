# Software Design Document (SDD): Phase 1 - Walking Skeleton

## 1. Contexto e Objetivo
Este documento define a especificação técnica para a primeira fase funcional do projeto: o **Walking Skeleton**. O objetivo é validar a conexão de rede, a sincronia de movimentação em grid e a comunicação via chat entre múltiplos clientes em uma sala (Lobby).

## 2. Arquitetura do Sistema
O sistema segue o modelo **Client-Server Authoritative**:
- **Servidor (Node.js/Socket.IO)**: Mantém o estado real do mundo, valida movimentos e replica mensagens.
- **Cliente (Phaser 3)**: Renderiza o estado recebido, captura inputs e gerencia a interface de chat em HTML.

## 3. Especificações de Funcionalidades

### 3.1. Login e Identificação
- **Fluxo**: O usuário entra com um `username`. O servidor gera um `id` único para o socket.
- **Sala Inicial**: Todos os usuários são alocados automaticamente na sala `room_lobby`.

### 3.2. Movimentação em Grid (Sincronizada)
- **Lógica**: O mundo é dividido em tiles de 32x32 pixels.
- **Validação**: O servidor verifica se o movimento é adjacente à posição atual (anti-teleport).
- **Interpolação**: O cliente usa `lerp` para suavizar a transição de outros jogadores entre os pontos do grid.
- **Mensagem Otimizada**: Usaremos chaves curtas para economia de banda.

### 3.4. Avatar e Representação Visual (Avatar.ts) [NOVO]
- **Encapsulamento**: Toda a lógica de desenho do placeholder geométrico deve residir na classe `Avatar`.
- **Indicador de Direção**: O avatar terá um pequeno triângulo ou traço indicando para onde está olhando (0=N, 1=S, 2=E, 3=W).
- **Customização de Cor**: A cor do avatar é definida pelo servidor no momento do login/join.

## 4. Protocolo de Comunicação (v1.1)
*Atualizado para incluir sincronização de cores.*

### Eventos (Client -> Server)
- `l` (Login): `{ n: string }`
- `m` (Move): `{ x: number, y: number, d: number }`
- `c` (Chat): `{ m: string }`

### Eventos (Server -> Client)
- `s` (State): `{ p: { [id: string]: { n: string, x: number, y: number, d: number, c: number } } }` // c = color
- `j` (Join): `{ id: string, n: string, x: number, y: number, c: number }`
- `q` (Quit): `{ id: string }`
- `m` (Moved): `{ id: string, x: number, y: number, d: number }`
- `c` (Chat): `{ id: string, m: string }`

## 5. Critérios de Aceite
1. Usuário consegue conectar e ver outros jogadores como placeholders geométricos.
2. Movimentação de um jogador é refletida para todos os outros na mesma sala com suavidade.
3. Mensagem de chat enviada aparece em um balão sobre a cabeça do avatar correspondente em todos os clientes.
