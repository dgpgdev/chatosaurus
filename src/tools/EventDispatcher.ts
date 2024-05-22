/**
 * Type definition for an event callback function.
 * This function can take any number of arguments of any type.
 */
// deno-lint-ignore no-explicit-any
type EventCallback = (...args: any[]) => void

/**
 * Interface to store event listeners.
 * The keys are event names (which can be strings or symbols),
 * and the values are arrays of callback functions associated with those events.
 */
interface EventListeners {
  [eventName: string | symbol]: EventCallback[]
}

export class EventEmitter {
  // Private property to store all event listeners
  private __listeners: EventListeners = {}

  /**
   * Registers an event listener for a specific event.
   *
   * @param eventName - The name of the event to listen for.
   * @param callback - The callback function to be invoked when the event is emitted.
   */
  on(eventName: string | symbol, callback: EventCallback): void {
    // Initialize the listener array if it does not exist
    if (!this.__listeners[eventName]) {
      this.__listeners[eventName] = []
    }

    // Add the callback to the listeners array
    this.__listeners[eventName].push(callback)
  }

  /**
   * Registers an event listener for a specific event only if there are no listeners for that event yet.
   *
   * @param eventName - The name of the event to listen for.
   * @param callback - The callback function to be invoked when the event is emitted.
   */
  only(eventName: string, callback: EventCallback): void {
    // Return early if the event already has listeners
    if (this.__listeners[eventName]) {
      return
    }

    // Assign the callback as the sole listener for the event
    this.__listeners[eventName] = [callback]
  }

  /**
   * Emits an event, invoking all registered listeners for that event.
   *
   * @param eventName - The name of the event to emit.
   * @param args - Arguments to pass to the event listeners.
   */
  emit(eventName: string, ...args: any[]): void {
    const eventListeners = this.__listeners[eventName]

    // If listeners are registered, invoke each listener with the provided arguments
    if (eventListeners) {
      for (const listener of eventListeners) {
        listener(...args)
      }
    }
  }

  /**
   * Removes a specific event listener for a specific event.
   *
   * @param eventName - The name of the event.
   * @param callback - The callback function to remove.
   */
  off(eventName: string, callback: EventCallback): void {
    const eventListeners = this.__listeners[eventName]

    // If listeners are registered, filter out the specified callback
    if (eventListeners) {
      this.__listeners[eventName] = eventListeners.filter(
        (listener) => listener !== callback
      )
    }
  }

  /**
   * Registers a one-time event listener for a specific event.
   * The listener will be invoked at most once and then removed.
   *
   * @param eventName - The name of the event.
   * @param callback - The callback function to be invoked when the event is emitted.
   */
  once(eventName: string, callback: EventCallback): void {
    // Create a wrapper function that removes itself after execution
    const fn = (...args: any[]) => {
      this.off(eventName, fn)
      callback(...args)
    }

    // Register the wrapper function as a listener
    this.on(eventName, fn)
  }

  /**
   * Removes all event listeners for all events.
   */
  removeAllListeners(): void {
    // Clear the listeners object
    this.__listeners = {}
  }

  /**
   * Returns the number of listeners for a specific event.
   *
   * @param eventName - The name of the event.
   * @returns The number of registered listeners for the specified event.
   */
  listenerCount(eventName: string | symbol): number {
    // Return the count of listeners for the specified event
    return this.__listeners[eventName]?.length || 0
  }

  /**
   * Returns the total number of listeners registered across all events.
   *
   * @returns The total number of registered listeners.
   */
  totalListenerCount(): number {
    let count = 0

    // Iterate over all events and sum up the number of listeners
    for (const listeners of Object.values(this.__listeners)) {
      count += listeners.length
    }

    return count
  }
}
