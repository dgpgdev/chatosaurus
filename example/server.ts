import {
  WebSocketServer,
  type WebSocketUser,
  type Context,
  type Next,
} from "@dgpg/chatosaurus"
import { Sleep } from "../src/tools/Sleep.ts"

const connectInfo = { hostname: "localhost", port: 4000 }

const logMiddleware = async (context: Context, next: Next) => {
  console.log("--------MIDDLEWARE LOG--------")
  console.log("Evt called => %s", context.evt)
  console.log("Client ID  => %s", context.ws.id)
  console.log("Data List  => %s", context.data)
  await Sleep.seconds(5)
  await next()
}
const authMiddleware = async (context: Context, next: Next) => {
  console.log("-------MIDDLEWARE AUTH--------")
  console.log("Evt called => %s", context.evt)
  console.log("Client ID  => %s", context.ws.id)
  console.log("Data List  => %s", context.data)
  await Sleep.seconds(2)
  next()
}

const server = new WebSocketServer(connectInfo)
server.use(logMiddleware)
server.use(authMiddleware)

server.on("onConnect", (user: WebSocketUser, headers: Headers) => {
  console.log("user connected", user.id)
  console.log("headers", headers)
  user.invoke("myClientEvent", `this is your client id ${user.id}`)
})

server.on("join", (user: WebSocketUser, roomId: string) => {
  user.join(roomId)
})

server.on("leave", (user: WebSocketUser, roomId: string) => {
  user.leave(roomId)
})

server.on("leaveAll", (user: WebSocketUser) => {
  user.leaveAll()
})

server.on("broadcast", (_user: WebSocketUser, message: string) => {
  server.broadcast("messageBroadCasted", message)
})

server.event("test", (user: WebSocketUser, data: string) => {
  console.log(user.id, data)
})

server.start()
setInterval(
  () => server.broadcast("broadcastedEvent", Math.floor(Math.random() * 10000)),
  30000
)
