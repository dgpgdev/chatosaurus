import { WebSocketUser } from '../type.d.ts'
import { Room } from './Room.ts'

/**
 * Class to manage rooms list
 * @author Gauthier de Girodon Pralong
 */
export class RoomManager {
  #roomList: Room[]
  /**
   * Constructor
   */
  constructor() {
    this.#roomList = []
  }

  /**
   * Get all rooms
   * @return {array} The room list
   */
  get rooms() {
    return this.#roomList
  }

  /**
   * Get room by roomId
   * @param {string} roomdID - the room id
   * @return {Room} the room object
   */
  getRoom(roomId: string) {
    return this.#roomList.find((room) => room.id === roomId)
  }

  /**
   * Create a new room if idRoom not already exist.
   * if a room with idroom already exist return this room
   * @param roomId room id to create
   * @param keepAlive defined if room keep alive
   * @returns
   */
  create(roomId: string, keepAlive = false) {
    let r = this.getRoom(roomId)
    if (r === undefined) {
      r = new Room(roomId, keepAlive)
      this.#roomList.push(r)
    }
    return r
  }

  /**
   * Add socket to room
   * @param {string} roomdID - the room id
   * @param {Websocket} socket - the websocket object
   */
  join(roomId: string, socket: WebSocketUser) {
    const r = this.create(roomId)
    socket.rooms.push(roomId)
    r.join(socket)
  }

  /**
   * Remove socket from room
   * @param {string} roomdID - the room id
   * @param {Websocket} socket - the websocket object
   */
  leave(roomId: string, socket: WebSocketUser) {
    const r = this.getRoom(roomId)
    if (r) {
      r.leave(socket)
      if (r.clients.length === 0 && !r.keepAlive) {
        this.#roomList = this.#roomList.filter((room) => room.id != roomId)
      }
    }
  }
}
