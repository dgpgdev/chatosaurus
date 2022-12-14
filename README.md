# What is Chatosaurus ?

Chatosaurus is a simple implementation of websocket for Deno to create simple chat system.
More easy to use, room system and middleware are natively.

## How to use

Server

```js
import { WebSocketServer, WebSocketUser } from './mod.ts'
import { sleep } from 'https://deno.land/x/sleep/mod.ts'
import { Context, Next } from './src/type.d.ts'

const connectInfo = { hostname: 'localhost', port: 4000 }

const logMiddleware = async (context: Context, next: Next) => {
  console.log('--------MIDDLEWARE LOG--------')
  console.log('Evt called => %s', context.evt)
  console.log('Client ID  => %s', context.ws.id)
  console.log('Data List  => %s', context.data)
  await sleep(5)
  await next()
}
const authMiddleware = async (context: Context, next: Next) => {
  console.log('-------MIDDLEWARE AUTH--------')
  console.log('Evt called => %s', context.evt)
  console.log('Client ID  => %s', context.ws.id)
  console.log('Data List  => %s', context.data)
  await sleep(2)
  next()
}

const server = new WebSocketServer(connectInfo)
server.use(logMiddleware)
server.use(authMiddleware)

server.on('onConnect', (user: WebSocketUser, headers: Headers) => {
  console.log('user connected', user.id)
  console.log('headers', headers)
  user.invoke('myClientEvent', `this is your client id ${user.id}`)
})

server.on('join', (user: WebSocketUser, roomId: string) => {
  user.join(roomId)
})

server.on('leave', (user: WebSocketUser, roomId: string) => {
  user.leave(roomId)
})

server.on('leaveAll', (user: WebSocketUser) => {
  user.leaveAll()
})

server.on('broadcast', (_user: WebSocketUser, message: string) => {
  server.broadcast('messageBroadCasted', message)
})

server.event('test', (user: WebSocketUser, data: string) => {
  console.log(user.id, data)
})

server.start()

setInterval(
  () => server.broadcast('broadcastedEvent', Math.floor(Math.random() * 10000)),
  300000
)
```

Client

```js
import { WebSocketClient } from './mod.ts'

const client = new WebSocketClient('ws://localhost:4000', {
  reconnect: true,
  delay: 5000,
})

client.on('error', (err) => console.log(err.message))

client.on('broadcastedEvent', (message) => {
  console.log(message)
})

client.on('myClientEvent', (message) => console.log(message))

client.connect()
```
