## Bootstrapping the app

Just run `npm install` to install the dependencies then `npm run dev` to start the app. There's no need to migrate anything since the test database is already set up in `prisma/dev.db` for your convenience.

## Issue description

When you click "Create user" or "Duplicate user", the server action crashes with an Unhandled Runtime Error.

This error wasn't present in next@14.1.0. To see the intended behaviour, simply `npm install next@14.1.0` and restart the server. Everything will work as expected.

next@14.1.1 causes this error. To see the error again, `npm install next@14.1.1` and restart the server. You can also `npm install next@latest` since as of next@14.2.4, this issue still persists.

If you aren't able to see this error in development, run `npm run build` to build the app and the error should be right there.

```
Unhandled Runtime Error
Error: operation(...) is not a function

Source
app/transactions.ts (23:42) @ tx

  21 | ): Transactable<AsyncFunctionType<TArgs, TReturn>> => {
  22 | const instant = (...args: TArgs) =>
> 23 |   prisma.$transaction((tx) => operation(tx)(...args));
     |                                        ^
  24 |
  25 | return Object.assign(instant, { via: operation });
  26 | };
Call Stack
Proxy._transactionWithCallback
/Users/phillmont/Developer/typeerror-starter/node_modules/@prisma/client/runtime/library.js (127:9540)
async
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js (39:406)
async t2
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js (38:6412)
async rS
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js (41:1369)
async doRender
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/base-server.js (1395:30)
async cacheEntry.responseCache.get.routeKind
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/base-server.js (1556:28)
async DevServer.renderToResponseWithComponentsImpl
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/base-server.js (1464:28)
async DevServer.renderPageComponent
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/base-server.js (1861:24)
async DevServer.renderToResponseImpl
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/base-server.js (1899:32)
async DevServer.pipeImpl
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/base-server.js (912:25)
async NextNodeServer.handleCatchallRenderRequest
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/next-server.js (269:17)
async DevServer.handleRequestImpl
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/base-server.js (808:17)
async
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/dev/next-dev-server.js (331:20)
async Span.traceAsyncFn
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/trace/trace.js (151:20)
async DevServer.handleRequest
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/dev/next-dev-server.js (328:24)
async invokeRender
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/lib/router-server.js (136:21)
async handleRequest
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/lib/router-server.js (315:24)
async requestHandlerImpl
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/lib/router-server.js (339:13)
async Server.requestListener
/Users/phillmont/Developer/typeerror-starter/node_modules/next/dist/server/lib/start-server.js (140:13)
```

## A little bit of context

As you can see, `createUser` isn't your typical server action (async function). It is wrapped in `transactable`.

The point of `transactable` is to allow an operation to be,

1. automatically wrapped in a `prisma.$transaction` when called immediately, e.g., `async createUser(...)`, and

2. be part of a bigger transaction, e.g., `async createUser.via(tx)(...)` (see `duplicateUser` that benefits from this pattern).

Notably, `transactable` returns a hybrid type. It is an async function that can be called immediately (this is a server action), and also an object with `.via(tx)` property.

This pattern allows me to write a complex operation function and use it both,

1. directly (as a server action, potentially in components) without having to manually wrap it in `prisma.$transaction` in yet another new function, and

2. indirectly as part of a bigger operation (and transaction).

Not sure if I'm the first to come up with this pattern, but it has served me well so far. Up until next@14.1.1 where all my `transactable`s are now broken. It worked fine up till next@14.1.0.

## What I have discovered

From next@14.1.1's changelog, it looks like there are some changes related to SWC. It seems like Next.js is compiling the returns of `transactable` as an empty object `{}`. This is why when it and `.via(tx)` are called, we get a `TypeError`.

## Expected behaviour

Just downgrade to next@14.1.0 with `npm install next@14.1.0` to see everything in this app working perfectly.

In particular, it should be that the returns of `transactable` aren't compiled as `{}`s. They should be actual hybrid types, i.e., async functions with `.via(tx)` property.
