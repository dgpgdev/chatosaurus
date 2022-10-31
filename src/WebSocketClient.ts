import { EventEmitter } from 'https://deno.land/std@0.148.0/node/events.ts?s=EventEmitter'
import { WebsocketClientConfig } from '../type.d.ts'

/**
 * Client class to communicate with easy-com server
 */
export class WebSocketClient extends EventEmitter {
  #uri: string
  #reconnect: boolean
  #currentAttempt: number
  #attempt?: number
  #delay?: number
  #interval: number
  #ws!: WebSocket
  /**
   * [uri description]
   * @type {String}
   */
  constructor(
    uri = '',
    options: WebsocketClientConfig = { reconnect: false, delay: 0, attempt: 0 }
  ) {
    super()
    this.#uri = uri
    this.#reconnect = options.reconnect
    this.#currentAttempt = 0
    this.#attempt = options.attempt
    this.#delay = options.delay
    this.#interval = 0
  }

  /**
   * call method to websocket server
   */
  invoke(evt: string, ...args: unknown[]) {
    this.#ws.send(JSON.stringify([evt, ...args]))
  }

  /**
   * initialize all listeners
   */
  initListeners() {
    /**
     * parse data received by server
     * @method onmessage
     * @param  {Array}  evt a string who represent array data sent by server
     */
    this.#ws.onmessage = (evt) => {
      this.emit.apply(this, JSON.parse(evt.data))
    }

    /**
     * [onopen description]
     * @method onopen
     * @param  {[type]} evt [description]
     * @return {[type]}     [description]
     */
    this.#ws.onopen = (evt) => {
      clearInterval(this.#interval)
      this.#currentAttempt = 0
      this.emit('open', evt)
    }

    /**
     * [onerror description]
     * @method onerror
     * @param  {[type]} evt [description]
     * @return {[type]}     [description]
     */
    this.#ws.onerror = (evt) => {
      this.emit('error', evt)
    }

    /**
     * [onclose description]
     * @method onclose
     * @param  {[type]} evt [description]
     * @return {[type]}     [description]
     */
    this.#ws.onclose = (evt) => {
      this.emit('close', evt)
      if (this.#reconnect) {
        this.#interval = setTimeout(
          this.reconnect.bind(this),
          this.#delay,
          this
        )
      } else {
        this.emit('disconnect', evt)
      }
    }
  }

  /**
   * Called when reconnect option is true.
   * Dispatch attempt event when the websocket try to connect.
   */
  reconnect() {
    if (this.#ws.readyState === 3) {
      if (this.#currentAttempt === this.#attempt && this.#attempt != 0) {
        clearInterval(this.#interval)
        this.emit('max_attempt', {
          attempt: this.#currentAttempt,
          max_attempt: this.#attempt,
        })
      } else {
        this.#currentAttempt += 1
        this.emit('attempt', {
          attempt: this.#currentAttempt,
          max_attempt: this.#attempt,
        })
        this.connect()
      }
    }
  }

  /**
   * Close the websocket
   */
  close() {
    this.#reconnect = false
    this.#ws.close()
  }

  /**
   * Connect the websocket
   */
  connect() {
    this.#ws = new WebSocket(this.#uri)
    this.initListeners()
  }
}
