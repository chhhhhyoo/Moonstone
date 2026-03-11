export class MessagingProvider {
  async postMessage(_targetId, _content, _options = {}) {
    throw new Error("MessagingProvider.postMessage must be implemented.");
  }

  async addReaction(_targetId, _messageId, _reaction) {
    throw new Error("MessagingProvider.addReaction must be implemented.");
  }

  async removeReaction(_targetId, _messageId, _reaction) {
    throw new Error("MessagingProvider.removeReaction must be implemented.");
  }
}

export class InMemoryMessagingProvider extends MessagingProvider {
  constructor() {
    super();
    this.messages = [];
    this.reactions = [];
  }

  async postMessage(targetId, content, options = {}) {
    this.messages.push({ targetId, content, options });
  }

  async addReaction(targetId, messageId, reaction) {
    this.reactions.push({ action: "add", targetId, messageId, reaction });
  }

  async removeReaction(targetId, messageId, reaction) {
    this.reactions.push({ action: "remove", targetId, messageId, reaction });
  }
}
