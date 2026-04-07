import { PortalEntryForm } from "../components/PortalEntryForm";

export default function HomePage() {
  return (
    <main className="portal-shell">
      <section className="portal-card">
        <p className="portal-eyebrow">Prototipo multiplayer</p>
        <h1 className="portal-title">Um universo social 2D no navegador.</h1>
        <p className="portal-description">
          Este portal captura a identidade local do jogador e encaminha a sessão para o cliente Phaser.
          O objetivo aqui é simplicidade: entrar rápido, conectar ao servidor Colyseus e validar o loop
          multiplayer básico.
        </p>
        <PortalEntryForm />
      </section>
    </main>
  );
}

