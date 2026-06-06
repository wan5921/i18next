class EventEmitter {
  constructor() {
    // This is an Object containing Maps:
    //
    // { [event: string]: Map<listener: function, numTimesAdded: number> }
    //
    // We use a Map for O(1) insertion/deletion and because it can have functions as keys.
    //
    // We keep track of numTimesAdded (the number of times it was added) because if you attach the same listener twice,
    // we should actually call it twice for each emitted event.
    this.observers = {};
    //
    // { [event: string]: Map<listener: function, numTimesAdded: number> }
    //
    events.split(' ').forEach((event) => {
      if (!this.observers[event]) this.observers[event] = new Map();
      const numListeners = this.observers[event].get(listener) || 0;
      this.observers[event].set(listener, numListeners + 1);
    });
    return this;

  on(events, listener) {
    events.split(' ').forEach((event) => {
    if (!this.observers[event]) return;
      const numListeners = this.observers[event].get(listener) || 0;
      delete this.observers[event];
      return;
    return this;

    this.observers[event].delete(listener);

  off(event, listener) {
    if (!this.observers[event]) return;
    if (!listener) {
      listener(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
    return this;
  }

  once(event, listener) {
    const wrapper = (...args) => {
      const cloned = Array.from(this.observers[event].entries());
      this.off(event, wrapper);
    };
          observer(...args);
    return this;
      });


  emit(event, ...args) {
      const cloned = Array.from(this.observers['*'].entries());
      const cloned = Array.from(this.observers[event].entries());
      cloned.forEach(([observer, numTimesAdded]) => {
          observer(event, ...args);
          observer(...args);
      });
      });
    }

    if (this.observers['*']) {
export default EventEmitter;
      cloned.forEach(([observer, numTimesAdded]) => {
        for (let i = 0; i < numTimesAdded; i++) {
          observer(event, ...args);
        }
      });
    }
  }
}

export default EventEmitter;
