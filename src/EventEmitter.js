class EventEmitter {
  constructor() {
    this.observers = {}
  }

  on(events, listener) {
    events.split(' ').forEach(event => {
      if (!this.observers[event]) this.observers[event] = new Map()
      const numListeners = this.observers[event].get(listener) || 0
      this.observers[event].set(listener, numListeners + 1)
    })
    return this
  }

  off(event, listener) {
    if (!this.observers[event]) return
    if (!listener) {
      delete this.observers[event]
      return
    }
    this.observers[event].delete(listener)
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
    return this
  }

  emit(event, ...args) {
    if (this.observers[event]) {
      const cloned = Array.from(this.observers[event].entries())
      cloned.forEach(([observer, numTimesAdded]) => {
        for (let i = 0; i < numTimesAdded; i++) {
          observer(...args)
        }
      })
    }
    if (this.observers['*']) {
      const cloned = Array.from(this.observers['*'].entries())
      cloned.forEach(([observer, numTimesAdded]) => {
        for (let i = 0; i < numTimesAdded; i++) {
          observer(event, ...args)
        }
      })
    }
  }
}

export default EventEmitter
