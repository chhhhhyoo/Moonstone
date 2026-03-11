import { ProviderProxy } from "../ProviderProxy.mjs";

export class ResearchProviderProxy extends ProviderProxy {
  constructor() {
    super({ providerName: "mock-research-provider" });
  }

  async query(payload) {
    const query = String(payload?.query ?? "").trim();
    if (!query) {
      throw new Error("ResearchProviderProxy requires non-empty query.");
    }
    return {
      source: this.providerName,
      items: [
        { id: "PTH-001", title: `Result for ${query}`, score: 0.91 }
      ]
    };
  }
}
