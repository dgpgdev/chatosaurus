import { WebSocketUser } from "../type.d.ts"

/**
 * Class to represent room
 * @author Gauthier de Girodon Pralong
 */
export class Room {
  id: string
  keepAlive: boolean
  #clientList: WebSocketUser[]
  /**
   * Constructor
   * @param {string} id - The id value
   * @param {boolean} keepAlive - flag to keep alive room when no user inside
   */
  constructor(id = "", keepAlive = false) {
    this.id = id
    this.keepAlive = keepAlive
    this.#clientList = []
  }

  /**
   * Add socket to room
   * @param {WebSocketUser} socket - the WebSocketUser object
   */
  join(socket: WebSocketUser) {
    if (this.#clientList.find((client) => client.id === socket.id)) return
    this.invoke("join", { roomId: this.id, userId: socket.id })
    this.#clientList.push(socket)
  }

  /**
   * Remove socket from room
   * @param {WebSocketUser} socket - the WebSocketUser object
   */
  leave(socket: WebSocketUser) {
    this.#clientList = this.#clientList.filter((u) => {
      return u.id != socket.id
    })
    this.invoke("leave", { roomId: this.id, userId: socket.id })
  }

  /**
   * invoke method to all sockets in room
   * @param {string} evt - event label
   * @param {Array} args - arguments array
   */
  invoke(evt: string, ...args: unknown[]) {
    this.#clientList.forEach((socket) => {
      socket.sendJSON([evt, ...args])
    })
  }

  /**
   * Get clients list
   * @return {Array} the clients list
   */
  get clients(): WebSocketUser[] {
    return this.#clientList
  }
}
