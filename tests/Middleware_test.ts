import { assertEquals } from "https://deno.land/std@0.158.0/testing/asserts.ts"

import { Context, WebSocketUser, Next } from "../mod.ts"
import MiddleWareManager from "../src/middleware/MiddleWareManager.ts"

Deno.test(`Test Middleware`, () => {
  const mdwm = new MiddleWareManager()
  const context: Context = {
    evt: "some",
    ws: { id: "4444" } as WebSocketUser,
    data: [0],
  }
  mdwm.use((ctx, next) => {
    ;(ctx.data[0] as number) += 1
    next()
  })
  mdwm.executeMiddleware(context)
  assertEquals(context.data[0], 1)
})
