import { DEFAULT_SERVER_PORT } from "@social-universe/shared";

export const GAME_SERVER_URL =
  import.meta.env.VITE_SERVER_URL ?? `ws://localhost:${DEFAULT_SERVER_PORT}`;

export const WEB_PORTAL_URL = import.meta.env.VITE_WEB_URL ?? "http://localhost:3000";

