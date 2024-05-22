import { Server } from "@std/http/server"
import { EventEmitter } from "./tools/EventDispatcher.ts"
import { RoomManager } from "./rooms/RoomManager.ts"
import { WebsocketServerConfig, Middleware, WebSocketUser } from "./type.d.ts"
import MiddleWareManager from "./middleware/MiddleWareManager.ts"
import { Room } from "../mod.ts"

interface WebSocketEmitter {
  event(
    eventName: string | symbol,
    listener: (context: WebSocketUser) => void
  ): WebSocketServer
  event(
    eventName: string | symbol,
    listener: (context: WebSocketUser, ...args: any[]) => void
  ): WebSocketServer
}

/**
 * Class permettant la création d'un server websocket
 */
export class WebSocketServer extends EventEmitter implements WebSocketEmitter {
  #config: WebsocketServerConfig
  #roomManager: RoomManager
  #middlewareManager
  #clientList: WebSocketUser[]
  #ws: Server
  #listener: Deno.Listener
  /**
   * Constructeur
   * @param config Object de configuration
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
   * Lance le server
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
   *
   * @param req
   * @returns
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
   * Add middleware to middlewareManager
   * @param {Object} middleware middleware function
   */
  use(middleware: Middleware<unknown>): WebSocketServer {
    this.#middlewareManager.use(middleware)
    return this
  }

  /**
   *
   * @param client
   * @param headers
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
   *
   * @param client Websocketuser
   * @param data
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
   *
   * @param e
   */
  private handleError(e: Event | ErrorEvent) {
    console.log(e instanceof ErrorEvent ? e.message : e.type)
  }

  /**
   *
   * @param client
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
   *
   * @param msg
   */
  private logError(msg: string) {
    console.log(msg)
  }

  /**
   * Arrete le server
   */
  stop() {
    this.#listener.close()
  }

  /**
   * Get all clients connected to server
   * @return {array} array list of socket
   */
  get clients(): WebSocketUser[] {
    return this.#clientList
  }

  /**
   * Get all rooms
   * @return {array} room list
   */
  get rooms(): Room[] {
    return this.#roomManager.rooms
  }

  /**
   * Get the room manager
   * @method roomManager
   * @return {RoomManager} the room manager
   */
  get roomManager(): RoomManager {
    return this.#roomManager
  }

  /**
   * Define host and port for connection
   * @returns {Object} Configuration Object
   */
  get config(): WebsocketServerConfig {
    return this.#config
  }

  set config(config: WebsocketServerConfig) {
    if (config) {
      this.#config = config
    }
  }

  broadcast(event: string, ...args: any[]) {
    this.#clientList.forEach((c) => {
      c.invoke.apply(this, [event, ...args])
    })
  }
  event(
    eventName: string | symbol,
    listener: (context: WebSocketUser, ...args: any[]) => void
  ): WebSocketServer {
    super.on(eventName, listener)
    return this
  }
}
