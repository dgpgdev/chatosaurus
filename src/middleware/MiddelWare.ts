import { WebSocketUser } from '../WebSocketUser.ts'

export type Middleware<T> = (context: Context, next: Next) => void | Promise<T>

export interface Context {
  evt: string
  ws: WebSocketUser
  data: unknown[]
}

export type Next = () => void | Promise<void>
