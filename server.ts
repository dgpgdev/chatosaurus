import { WebSocketServer, WebSocketUser } from './mod.ts'

const connectInfo = { hostname: 'localhost', port: 8080 }

const server = new WebSocketServer(connectInfo)

server.on('join', (user: WebSocketUser, roomId: string) => {
  user.join(roomId)
})

server.on('leave', (user: WebSocketUser, roomId: string) => {
  user.leave(roomId)
})

server.on('leaveAll', (user: WebSocketUser, roomId: string) => {
  user.leaveAll
})

server.start()
