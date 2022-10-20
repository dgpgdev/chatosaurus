import Room from './rooms/Room.ts'

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
