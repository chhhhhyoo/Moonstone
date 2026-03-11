export class DomainProvider {
  async query(_payload) {
    throw new Error("DomainProvider.query must be implemented.");
  }
}
