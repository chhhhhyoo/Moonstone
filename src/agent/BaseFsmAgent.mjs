export class BaseFsmAgent {
  constructor({ definition, machine }) {
    this.definition = definition;
    this.machine = machine;
    this.currentState = machine.initial;
  }

  get id() {
    return this.definition.id;
  }

  snapshot() {
    return this.currentState;
  }
}
