import { Room } from './rooms/Room.ts'

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
/**
 * Objet de configuration du server
 */
export type WebsocketClientConfig = {
  /** define if client need to reconnect to the server when close event detected */
  reconnect: boolean
  /** if reconnect is true, define number to retry connection */
  attempt?: number
  /** if reconnect is true, define number millisecond betwwen retry*/
  delay?: number
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
  /** uuid v4 */
  id: string

  /** room list */
  rooms: string[]

  /** add client to room */
  join(roomId: string): void

  /** remove client from room */
  leave(roomId: string): void

  /** leave client from all rooms */
  leaveAll(): void

  /** get room object */
  room(roomId: string): Room | undefined

  /** invoke method on client client */
  invoke(evt: string, ...args: unknown[]): void

  /** get client object by uuid */
  to(clientId: string): void

  /** invoke method to all connected client */
  broadcast(evt: string, ...args: unknown[]): void

  /** Send JSON data to client */
  sendJSON(data: unknown): void
}
