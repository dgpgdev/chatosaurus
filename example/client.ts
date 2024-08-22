import { WebSocketClient } from "@dgpg/chatosaurus"

const client = new WebSocketClient("ws://localhost:4000", {
  reconnect: true,
  delay: 5000,
})

client.on("error", (err) => console.log(err.message))

client.on("broadcastedEvent", (message) => {
  console.log(message)
})

client.on("myClientEvent", (message) => console.log(message))

client.connect()
