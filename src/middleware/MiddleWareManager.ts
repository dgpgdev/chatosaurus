import { Context, Middleware } from './MiddelWare.ts'

export default class MiddleWareManager {
  middlewareList: Middleware<unknown>[]
  constructor() {
    this.middlewareList = []
  }

  /**
   * Add Middleware to list. Can be chain
   */
  use(...middleware: Middleware<unknown>[]) {
    this.middlewareList.push(...middleware)
  }

  /**
   * iterate the middleware list
   */
  async iterateMiddleWare(
    context: Context,
    middlewares: Middleware<unknown>[]
  ) {
    if (middlewares.length === 0) return
    const mw = middlewares[0]

    return mw(context, async () => {
      await this.iterateMiddleWare(context, middlewares.slice(1))
    })
  }

  /**
   * executeMiddleware
   */
  executeMiddleware(context: Context): Promise<unknown> | void {
    return this.iterateMiddleWare(context, this.middlewareList)
  }
}
