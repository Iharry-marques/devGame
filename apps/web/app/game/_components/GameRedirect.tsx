"use client";

import { useEffect, useState } from "react";

import { PLAYER_SESSION_STORAGE_KEY } from "../../../lib/session";

type StoredSession = {
  name: string;
  avatar: string;
};

const GAME_URL = process.env.NEXT_PUBLIC_GAME_URL ?? "http://localhost:3001";

export function GameRedirect() {
  const [message, setMessage] = useState("Preparando sua entrada no universo...");

  useEffect(() => {
    const rawSession = localStorage.getItem(PLAYER_SESSION_STORAGE_KEY);

    if (!rawSession) {
      setMessage("Sessao nao encontrada. Volte para a pagina inicial.");
      return;
    }

    const session = JSON.parse(rawSession) as StoredSession;
    const url = new URL(GAME_URL);

    url.searchParams.set("name", session.name);
    url.searchParams.set("avatar", session.avatar);

    window.location.href = url.toString();
  }, []);

  return (
    <section className="redirect-card">
      <h1 className="portal-title" style={{ fontSize: "2rem" }}>
        Carregando jogo
      </h1>
      <p className="portal-description">{message}</p>
    </section>
  );
}
