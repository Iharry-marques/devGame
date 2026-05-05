import './styles/global.css';
import Phaser from 'phaser';
import { connectSocket, getSocket } from './socket';
import { GameScene } from './game/GameScene';

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
  
  // LOGIN (l) v1.0
  socket.emit('l', { n: playerName });

  // Oculta login e mostra o jogo
  loginOverlay.style.display = 'none';
  gameContainer.style.display = 'flex';

  // ── Inicializa o Phaser ───────────────────────────────────────
  new Phaser.Game({
    type: Phaser.AUTO,
    width: 1280, // Largura fixa do lobby conforme SDD
    height: 704,
    backgroundColor: '#0f172a',
    parent: 'phaser-canvas',
    scene: [GameScene],
    callbacks: {
      preBoot: (game: Phaser.Game) => {
        game.registry.set('socket', socket);
        game.registry.set('localId', socket.id);
      },
    },
  });

  // ── Chat HTML lateral (Mensagens do servidor 'c') ───────────────────────
  socket.on('c', (msg: { id: string, m: string }) => {
    // Para o chat lateral, precisaríamos do nome, mas no Protocolo v1.0 
    // estamos enviando apenas o ID por eficiência. 
    // Por agora, mostraremos apenas a mensagem ou ID. 
    // Futuramente podemos mapear ID para Name no cliente.
    const li = document.createElement('li');
    li.innerHTML = `<span class="chat-author">${msg.id.slice(0,4)}:</span> <span class="chat-text">${msg.m}</span>`;
    chatHistory.appendChild(li);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  });
}

function startGame(playerName: string): void {
  const socket = connectSocket();
  if (socket.connected) {
    launchGame(playerName);
  } else {
    socket.once('connect', () => launchGame(playerName));
  }
}

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

// ── Enviar mensagem de chat (c) v1.0 ────────────────────────────────────────
function sendChatMessage(): void {
  const socket = getSocket();
  const text = chatInput.value.trim();
  if (!text) return;
  socket.emit('c', { m: text });
  chatInput.value = '';
}

chatSendBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChatMessage();
});
