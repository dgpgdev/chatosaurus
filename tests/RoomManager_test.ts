import {
  assertEquals,
  assertExists,
  assertInstanceOf,
} from 'https://deno.land/std@0.158.0/testing/asserts.ts'
import { Room, RoomManager } from '../mod.ts'

Deno.test(`Room Manager no room at start`, () => {
  const rm = new RoomManager()
  assertEquals(rm.rooms.length, 0)
})
Deno.test(`Room Manager Create Room`, () => {
  const rm = new RoomManager()
  assertEquals(rm.rooms.length, 0)
  rm.create('my room')
  assertEquals(rm.rooms.length, 1)
})

Deno.test(`Room Manager get room`, () => {
  const rm = new RoomManager()
  const roomId = `#1`
  rm.create(roomId)
  assertExists(rm.getRoom(roomId))
  assertInstanceOf(rm.getRoom(roomId), Room)
  assertEquals(rm.getRoom(roomId)?.clients.length, 0)
})
