import './styles/global.css';
import Phaser from 'phaser';
import { connectSocket, getSocket } from './socket';
import { GameScene } from './game/GameScene';
import { ChatMessage } from '../../server/src/types';

// ── Elementos da UI ────────────────────────────────────────────────────────
const loginOverlay  = document.getElementById('login-overlay')!;
const gameContainer = document.getElementById('game-container')!;
const nameInput     = document.getElementById('player-name-input') as HTMLInputElement;
const joinBtn       = document.getElementById('join-btn')!;
const chatHistory   = document.getElementById('chat-history')!;
const chatInput     = document.getElementById('chat-input') as HTMLInputElement;
const chatSendBtn   = document.getElementById('chat-send-btn')!;

// ── Lançar Phaser e mostrar o jogo ─────────────────────────────────────────
function launchGame(playerName: string): void {
  const socket = getSocket();
  const localId = socket.id!;

  socket.emit('player:join', { name: playerName });

  // Oculta login e mostra o jogo
  loginOverlay.style.display = 'none';
  gameContainer.style.display = 'flex';

  // ── Inicializa o Phaser ───────────────────────────────────────
  new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth - 280,
    height: window.innerHeight,
    backgroundColor: '#0f0f1a',
    parent: 'phaser-canvas',
    scene: [GameScene],
    callbacks: {
      preBoot: (game: Phaser.Game) => {
        game.registry.set('socket', socket);
        game.registry.set('localId', localId);
      },
    },
  });

  // ── Chat HTML lateral ─────────────────────────────────────────
  socket.on('chat:message', (msg: ChatMessage) => {
    const li = document.createElement('li');

    const author = document.createElement('span');
    author.className = 'chat-author';
    author.textContent = msg.playerName;

    const text = document.createElement('span');
    text.className = 'chat-text';
    text.textContent = msg.text;

    li.appendChild(author);
    li.appendChild(text);
    chatHistory.appendChild(li);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  });
}

// ── Iniciar jogo após escolher nome ───────────────────────────────────────
function startGame(playerName: string): void {
  const socket = connectSocket();

  if (socket.connected) {
    // Socket já conectado — dispara imediatamente
    launchGame(playerName);
  } else {
    // Aguarda a primeira conexão
    socket.once('connect', () => launchGame(playerName));
  }
}

// ── Login: botão e Enter ───────────────────────────────────────────────────
joinBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name) startGame(name);
});

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const name = nameInput.value.trim();
    if (name) startGame(name);
  }
});

// ── Enviar mensagem de chat ────────────────────────────────────────────────
function sendChatMessage(): void {
  const socket = getSocket();
  const text = chatInput.value.trim();
  if (!text) return;
  socket.emit('chat:message', { text });
  chatInput.value = '';
}

chatSendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChatMessage();
});
