import {
  assertEquals,
  assertExists,
  assertInstanceOf,
} from 'https://deno.land/std@0.158.0/testing/asserts.ts'
import { WebSocketServer } from '../ws/WebSocketServer.ts'

Deno.test(`Room Manager no room at start`, () => {
  const server = new WebSocketServer()
  server.use()
})
