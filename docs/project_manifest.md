# Project Manifest: Multiplayer Social Game

## 1. Vision & Concept
Um ambiente virtual focado em presença social, avatares e chat em tempo real. O objetivo é criar um espaço seguro e escalável para interação entre usuários, utilizando uma perspectiva 2D/Isométrica.

## 2. Core Pillars (Mentalidade MVP)
- **Caminho Crítico**: Foco total em Movimentação, Presença e Comunicação. Funcionalidades cosméticas ou secundárias ficam no backlog até a validação da rede.
- **Servidor Autoritativo**: Toda a lógica de estado, colisão e permissão reside no servidor (Node.js). O cliente é um terminal de renderização.
- **Segurança**: Prevenção de cheats via validação de inputs e limites de taxa de mensagens (rate limiting).
- **Design Original**: Proibida a cópia de assets ou engenharia reversa de terceiros. Estética original e genérica.

## 3. Tech Stack
- **Frontend**: Phaser 3, TypeScript, Vite.
- **Backend**: Node.js, TypeScript, Socket.IO.
- **Infraestrutura**:
  - Estado inicial: RAM (In-memory).
  - Escala: Preparado para PostgreSQL (Persistência) e Redis (Pub/Sub para múltiplas instâncias).

## 4. Roadmap (Fase Atual: 0)
- **Fase 0**: Estratégia e Infraestrutura (Networking & Room Logic).
- **Fase 1**: Walking Skeleton (Login -> Sala -> Movimentação -> Chat).
- **Fase 2**: Estética e Assets (Spritesheets, Tilesets).
- **Fase 3**: Persistência e Customização (Perfis, Inventários).
