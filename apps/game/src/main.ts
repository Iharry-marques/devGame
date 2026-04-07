import { JoinOptions, toAvatarId } from "@social-universe/shared";
import Phaser from "phaser";

import { WEB_PORTAL_URL } from "./config/env";
import { GameScene } from "./game/GameScene";
import { NetworkManager } from "./network/NetworkManager";
import "./styles.css";
import { ChatOverlay } from "./ui/ChatOverlay";

function getProfileFromUrl(): JoinOptions | null {
  const url = new URL(window.location.href);
  const name = url.searchParams.get("name")?.trim() ?? "";
  const avatar = toAvatarId(url.searchParams.get("avatar") ?? undefined);

  if (!name) {
    return null;
  }

  return {
    name,
    avatar
  };
}

async function bootstrap(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>("#app");

  if (!app) {
    throw new Error("Missing app mount");
  }

  const profile = getProfileFromUrl();

  if (!profile) {
    window.location.href = WEB_PORTAL_URL;
    return;
  }

  app.innerHTML = `
    <div class="game-shell">
      <div class="game-header">
        <div>
          <h1>Social Universe</h1>
          <p>Explore a sala, encontre pessoas e converse em tempo real.</p>
        </div>
      </div>
      <div class="game-stage">
        <div id="phaser-root" class="phaser-root"></div>
      </div>
    </div>
  `;

  const network = new NetworkManager();
  await network.connect(profile);

  const scene = new GameScene(network);
  const phaserRoot = document.querySelector<HTMLDivElement>("#phaser-root");

  if (!phaserRoot) {
    throw new Error("Missing phaser mount");
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: phaserRoot,
    scene: [scene],
    backgroundColor: "#142236",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  });

  const chat = new ChatOverlay({
    mount: app,
    onSend: (message) => {
      network.sendChat(message);
    }
  });

  network.on("chat", (message) => {
    chat.addMessage(message);
  });

  window.addEventListener("beforeunload", () => {
    game.destroy(true);
  });
}

bootstrap().catch((error) => {
  console.error(error);
});

