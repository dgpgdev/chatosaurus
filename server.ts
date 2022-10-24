import { WebSocketServer } from './mod.ts'

const connectInfo = { hostname: 'localhost', port: 8080 }

const server = new WebSocketServer(connectInfo)
server.start()
