import { Room } from './src/rooms/Room.ts'

/**
 * Objet de configuration du server
 */
export type WebsocketServerConfig = {
  /** hostname */
  hostname: string
  /** port server */
  port: number
  /** use tls or not */
  secure?: boolean
  /** The path to the file containing the TLS private key. */
  keyFile?: string
  /** The path to the file containing the TLS certificate */
  certFile?: string
}

export type Middleware<T> = (context: Context, next: Next) => void | Promise<T>

/**
 * Middleware context object
 */
export interface Context {
  /** event name */
  evt: string
  /** websocket user */
  ws: WebSocketUser
  /** list of params */
  data: unknown[]
}

/**
 * next function
 */
export type Next = () => void | Promise<void>

/**
 * WebSocket User interface
 */
export interface WebSocketUser extends WebSocket {
  // uuid v4
  id: string
  // room list
  rooms: string[]
  //add client to room
  join(roomId: string): void
  //remove client from room
  leave(roomId: string): void

  //leave client from all rooms
  leaveAll(): void

  //get room object
  room(roomId: string): Room | undefined

  //invoke method on client client
  invoke(evt: string, ...args: unknown[]): void
  //get client by uuid
  to(clientId: string): void

  //invoke method to all connected client
  broadcast(evt: string, ...args: unknown[]): void

  sendJSON(data: unknown): void
}
