import { Server } from "@std/http/server"
import { EventEmitter } from "./tools/EventDispatcher.ts"
import { RoomManager } from "./rooms/RoomManager.ts"
import { WebsocketServerConfig, Middleware, WebSocketUser } from "./type.d.ts"
import MiddleWareManager from "./middleware/MiddleWareManager.ts"
import { Room } from "../mod.ts"

/**
 * Interface for WebSocketEmitter.
 * @interface
 */
interface WebSocketEmitter {
  /**
   * Add an event listener to the WebSocket server.
   * @param {string | symbol} eventName - The name of the event.
   * @param {Function} listener - The event listener function.
   * @returns {WebSocketServer} - The WebSocket server instance.
   */
  event(
    eventName: string | symbol,
    listener: (context: WebSocketUser) => void
  ): WebSocketServer
  /**
   * Add an event listener to the WebSocket server with additional arguments.
   * @param {string | symbol} eventName - The name of the event.
   * @param {Function} listener - The event listener function.
   * @returns {WebSocketServer} - The WebSocket server instance.
   */
  event(
    eventName: string | symbol,
    listener: (context: WebSocketUser, ...args: any[]) => void
  ): WebSocketServer
}

/**
 * Class for creating a WebSocket server.
 * @extends EventEmitter
 * @implements WebSocketEmitter
 */
export class WebSocketServer extends EventEmitter implements WebSocketEmitter {
  #config: WebsocketServerConfig
  #roomManager: RoomManager
  #middlewareManager
  #clientList: WebSocketUser[]
  #ws: Server
  #listener: Deno.Listener
  /**
   * Create a new WebSocket server instance.
   * @param {WebsocketServerConfig} [config={ hostname: "localhost", port: 8000 }] - The server configuration.
   */
  constructor(
    config: WebsocketServerConfig = { hostname: "localhost", port: 8000 }
  ) {
    super()
    this.#ws = new Server({ handler: this.reqHandler.bind(this) })
    this.#listener = Deno.listen({
      hostname: config.hostname,
      port: config.port,
    })
    this.#config = config
    this.#roomManager = new RoomManager()
    this.#middlewareManager = new MiddleWareManager()
    this.#clientList = []
  }

  /**
   * Start the WebSocket server.
   * @returns {Deno.Listener | Deno.TlsListener} - The listener instance.
   */
  start(): Deno.Listener | Deno.TlsListener {
    if (this.#config.secure) {
      if (!this.#config.certFile || !this.#config.keyFile) {
        throw new Error("certfile or keyFile are not defined")
      }
      this.#listener = Deno.listenTls({
        hostname: this.#config.hostname,
        port: this.#config.port,
        certFile: this.#config.certFile,
        keyFile: this.#config.keyFile,
      })
    }
    this.#ws.serve(this.#listener)
    return this.#listener
  }

  /**
   * Handle incoming requests and upgrade them to WebSocket connections.
   * @param {Request} req - The incoming request.
   * @returns {Response} - The upgraded response.
   */
  reqHandler(req: Request): Response {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 })
    }
    const upgraded = Deno.upgradeWebSocket(req)
    const client: WebSocketUser = upgraded.socket as WebSocketUser
    // cwebsocket basic function
    client.onopen = (_evt) => this.connected(client, req.headers)
    client.onmessage = (m) => this.message(client, m.data)
    client.onclose = (_evt) => this.disconnected(client)
    client.onerror = (e) => this.handleError(e)

    return upgraded.response
  }

  /**
   * Add middleware to the middleware manager.
   * @param {Middleware<unknown>} middleware - The middleware function.
   * @returns {WebSocketServer} - The WebSocket server instance.
   */
  use(middleware: Middleware<unknown>): WebSocketServer {
    this.#middlewareManager.use(middleware)
    return this
  }

  /**
   * Handle a new WebSocket connection.
   * @param {WebSocketUser} client - The WebSocket client.
   * @param {Headers} headers - The request headers.
   */
  connected(client: WebSocketUser, headers: Headers) {
    //define rooms property for socket
    client.id = crypto.randomUUID()
    // initialize client room list
    client.rooms = []

    // client join a room
    client.join = (roomId: string) => {
      this.#roomManager.join(roomId, client)
    }

    //remove client from room
    client.leave = (roomId: string) => {
      this.#roomManager.leave(roomId, client)
    }

    /**
     * user leave all rooms
     */
    client.leaveAll = () => {
      client.rooms.forEach((roomId: string) => {
        client.leave(roomId)
      })
    }

    /**
     * Récupère les information de la room
     */
    client.room = (roomId: string) => {
      return this.#roomManager.getRoom(roomId)
    }

    /**
     * invoke method on client client
     * */
    client.invoke = (evt: string, ...args: unknown[]) => {
      client.send(JSON.stringify([evt, ...args]))
    }

    /**
     * Get Client
     * */
    client.to = (clientId: string) => {
      return this.#clientList.find((client) => client.id === clientId)
    }

    //invoke method to all connected client
    client.broadcast = (evt: string, ...args: unknown[]) => {
      this.#clientList.forEach((client) =>
        client.invoke.apply(this, [evt, ...args])
      )
    }

    // send json message
    client.sendJSON = (data: unknown) => {
      client.send(JSON.stringify(data))
    }
    // addUser to connected socket list
    this.#clientList.push(client)

    // dispatch event
    this.emit("onConnect", client, headers)
  }

  /**
   * Handle a message received from a WebSocket connection.
   * @param {WebSocketUser} client - The WebSocket client.
   * @param {string} data - The message data.
   */
  private async message(client: WebSocketUser, data: string) {
    const parsedData = JSON.parse(data)
    const [evt, ...arg] = parsedData
    await this.#middlewareManager.executeMiddleware({
      evt,
      ws: client,
      data: arg,
    })
    this.emit(evt, client, ...arg)
  }

  /**
   * Handle an error that occurs during WebSocket communication.
   * @param {Event | ErrorEvent} e - The error event.
   */
  private handleError(e: Event | ErrorEvent) {
    console.log(e instanceof ErrorEvent ? e.message : e.type)
  }

  /**
   * Handle a WebSocket connection being closed.
   * @param {WebSocketUser} client - The WebSocket client.
   */
  private disconnected(client: WebSocketUser) {
    const userIndex = this.#clientList.findIndex((c) => client.id === c.id)
    if (userIndex === -1) {
      this.logError(`user not found`)
    }
    client.rooms.forEach((r) => this.roomManager.getRoom(r)?.leave(client))
    this.#clientList.splice(userIndex, 1)
  }

  /**
   * Log an error message.
   * @param {string} msg - The error message.
   */
  private logError(msg: string) {
    console.log(msg)
  }

  /**
   * Stop the WebSocket server.
   */
  stop() {
    this.#listener.close()
  }

  /**
   * Get the list of connected clients.
   * @returns {WebSocketUser[]} - The list of connected clients.
   */
  get clients(): WebSocketUser[] {
    return this.#clientList
  }

  /**
   * Get the list of rooms.
   * @returns {Room[]} - The list of rooms.
   */
  get rooms(): Room[] {
    return this.#roomManager.rooms
  }

  /**
   * Get the room manager.
   * @returns {RoomManager} - The room manager.
   */
  get roomManager(): RoomManager {
    return this.#roomManager
  }

  /**
   * Get the server configuration.
   * @returns {WebsocketServerConfig} - The server configuration.
   */
  get config(): WebsocketServerConfig {
    return this.#config
  }

  /**
   * Set the server configuration.
   * @param {WebsocketServerConfig} config - The server configuration.
   */
  set config(config: WebsocketServerConfig) {
    if (config) {
      this.#config = config
    }
  }

  /**
   * Broadcast a message to all connected clients.
   * @param {string} event - The event name.
   * @param {any[]} args - The event arguments.
   */
  broadcast(event: string, ...args: any[]) {
    this.#clientList.forEach((c) => {
      c.invoke.apply(this, [event, ...args])
    })
  }

  /**
   * Add an event listener to the WebSocket server.
   * @param {string | symbol} eventName - The event name.
   * @param {Function} listener - The event listener function.
   * @returns {WebSocketServer} - The WebSocket server instance.
   */
  event(
    eventName: string | symbol,
    listener: (context: WebSocketUser, ...args: any[]) => void
  ): WebSocketServer {
    super.on(eventName, listener)
    return this
  }
}
