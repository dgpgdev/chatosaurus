import { Context, Middleware } from '../type.d.ts'

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
  async executeMiddleware(context: Context): Promise<any> {
    return await this.iterateMiddleWare(context, this.middlewareList)
  }
}
