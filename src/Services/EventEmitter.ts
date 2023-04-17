import Events from "events";

export default class EventEmitter extends Events {
  constructor() {
    super();

    this.setMaxListeners(0);
  }
}
