import { ChatMessage, sanitizeChatMessage } from "@social-universe/shared";

type ChatOverlayOptions = {
  mount: HTMLElement;
  onSend: (message: string) => void;
};

export class ChatOverlay {
  private readonly messagesList: HTMLDivElement;

  constructor({ mount, onSend }: ChatOverlayOptions) {
    const root = document.createElement("div");
    root.className = "chat-overlay";

    this.messagesList = document.createElement("div");
    this.messagesList.className = "chat-messages";

    const form = document.createElement("form");
    form.className = "chat-form";

    const input = document.createElement("input");
    input.className = "chat-input";
    input.placeholder = "Digite uma mensagem";

    const button = document.createElement("button");
    button.className = "chat-button";
    button.textContent = "Enviar";
    button.type = "submit";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const value = sanitizeChatMessage(input.value);

      if (!value) {
        return;
      }

      onSend(value);
      input.value = "";
    });

    form.append(input, button);
    root.append(this.messagesList, form);
    mount.append(root);
  }

  addMessage(message: ChatMessage): void {
    const item = document.createElement("div");
    item.className = "chat-item";
    const author = document.createElement("strong");
    author.textContent = message.playerName;

    item.append(author, document.createTextNode(`: ${message.message}`));

    this.messagesList.append(item);
    this.messagesList.scrollTop = this.messagesList.scrollHeight;
  }
}
