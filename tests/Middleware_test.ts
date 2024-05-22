import { assertEquals } from "@std/asserts"
import { Context, Next, WebSocketUser } from "../mod.ts"
import MiddleWareManager from "../src/middleware/MiddleWareManager.ts"

Deno.test(`Test Middleware`, () => {
  const mdwm = new MiddleWareManager()
  const context: Context = {
    evt: "some",
    ws: { id: "4444" } as WebSocketUser,
    data: [0],
  }
  mdwm.use((ctx, next: Next) => {
    ;(ctx.data[0] as number) += 1
    next()
  })
  mdwm.executeMiddleware(context)
  assertEquals(context.data[0], 1)
})
