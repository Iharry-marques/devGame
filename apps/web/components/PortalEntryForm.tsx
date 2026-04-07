"use client";

import { AVATAR_OPTIONS, AvatarId, sanitizePlayerName } from "@social-universe/shared";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PLAYER_SESSION_STORAGE_KEY } from "../lib/session";
import { AvatarPicker } from "./AvatarPicker";

type PortalSession = {
  name: string;
  avatar: AvatarId;
};

export function PortalEntryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<AvatarId>(AVATAR_OPTIONS[0]);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sanitizedName = sanitizePlayerName(name);

    if (!sanitizedName) {
      setError("Informe um nome para entrar no universo.");
      return;
    }

    const session: PortalSession = {
      name: sanitizedName,
      avatar
    };

    localStorage.setItem(PLAYER_SESSION_STORAGE_KEY, JSON.stringify(session));
    router.push("/game");
  };

  return (
    <form className="portal-form" onSubmit={handleSubmit}>
      <label className="portal-label">
        Nome do jogador
        <input
          className="portal-input"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          placeholder="Ex.: Navegante Azul"
          maxLength={18}
        />
      </label>

      <div className="portal-label">
        Avatar
        <AvatarPicker value={avatar} onChange={setAvatar} />
      </div>

      {error ? <div className="portal-helper">{error}</div> : null}
      <button className="portal-submit" type="submit">
        Entrar no universo
      </button>
    </form>
  );
}

