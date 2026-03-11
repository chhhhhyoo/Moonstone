import { DomainProvider } from "./DomainProvider.mjs";

export class ProviderProxy extends DomainProvider {
  constructor({ providerName }) {
    super();
    this.providerName = providerName;
  }
}
