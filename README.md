# tRPC Course

This README explains tRPC: what it is, how the server and client work together, and what problem it actually solves.

## Overview

- tRPC has a **client** and a **server**.
- It provides **type safety** between client and server — TypeScript types are shared automatically instead of being duplicated by hand.
- This example creates a simple Express server and adds tRPC, so the frontend can call backend functions without writing traditional REST endpoints.

## Server Side

Install the server package:

```bash
npm install @trpc/server
```

**`initTRPC`** is the class used to create the tRPC instance, which gives you the methods needed to define procedures and build a router.

```ts
import express from "express";
import cors from "cors";
// Browsers block requests between different ports/domains by default.
// app.use(cors({ origin: "..." })) tells the backend:
// "It's okay, I trust this website" — i.e. it allows requests
// only from the specified origin (e.g. http://localhost:5173).

import { initTRPC } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

const t = initTRPC.create();

const appRouter = t.router({
  // t.procedure.query   -> for reading data (like a GET request)
  // t.procedure.mutation -> for writing/changing data (like a POST request)

  sayHi: t.procedure.query(() => {
    return "Hi";
  }),

  // .input() lets you validate incoming data before the handler runs
  logToServer: t.procedure
    .input((v) => {
      if (typeof v === "string") return v;
      throw new Error("Invalid input: expected a string");
    })
    .mutation((req) => {
      console.log(`Client says: ${req.input}`);
      return true;
    }),
});

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use("/trpc", createExpressMiddleware({ router: appRouter }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

// Export the router's type so the frontend can use it for full type safety
export type AppRouter = typeof appRouter;
```

## What tRPC Actually Is (and Isn't)

A common point of confusion: **"Does tRPC create an API, or is it just a secure connection?"**

Short answer:

- ✅ tRPC **does** create an API.
- ❌ tRPC is **not** a secure connection by itself.
- ✅ tRPC is a framework for building **type-safe APIs** between client and server.

### What is an API?

An API is just a way for two programs to communicate.

```
React App
   │
   │  "sayHi()"
   ▼
Backend
   │
   ▼
Returns "Hi"
```

That's an API — regardless of how it's implemented.

### REST vs. tRPC

**REST**, you manually define an endpoint:

```ts
app.get("/sayHi", (req, res) => {
  res.json("Hi");
});
```

The frontend calls it with a plain HTTP request:

```
GET /sayHi
```

**tRPC**, you define a procedure instead:

```ts
const appRouter = t.router({
  sayHi: t.procedure.query(() => "Hi"),
});
```

The frontend calls it like a function:

```ts
trpc.sayHi.query();
```

There is still an HTTP request happening under the hood:

```
React
  │
  │ HTTP Request
  ▼
Express
  │
  │ createExpressMiddleware
  ▼
appRouter
  │
  ▼
sayHi()
```

The difference is that you never manually define REST routes like `/users` or `/posts` — you just write functions, and tRPC exposes them.

### Does tRPC create APIs?

Yes. Defining a router like this:

```ts
const appRouter = t.router({
  sayHi: ...,
  logToServer: ...,
});
```

creates API procedures. Internally, they're all exposed through a single HTTP endpoint (`/trpc`) instead of many separate REST routes:

```
GET    /users
POST   /users
DELETE /users/5
```

### Is tRPC a secure connection?

No. Security comes from separate concerns:

- HTTPS (encryption in transit)
- Authentication (JWT, sessions, OAuth)
- Authorization (permissions)
- CORS
- Input validation
- Rate limiting

tRPC doesn't provide any of these automatically — you still need to add them yourself.

```
React
  │
  │ HTTPS  <- this is what encrypts the connection, not tRPC
  ▼
tRPC
  │
  ▼
Database
```

### What does tRPC actually do?

Think of it as a translator between your frontend and backend that keeps their types in sync.

**Without tRPC**, you fetch raw JSON and manually keep frontend/backend types matched:

```
React → fetch("/users") → JSON → Backend → JSON → React
                                      │
                        (you manually write matching TS types)
```

**With tRPC**, TypeScript automatically knows the function names, inputs, and outputs shared between client and server — no manual type duplication.

### Why "type-safe RPC"?

RPC stands for **Remote Procedure Call**. Instead of thinking:

> "Make an HTTP request to `/users/5`"

you think:

> "Call this function that happens to live on another computer."

Compare:

```ts
// Local function
add(2, 3);

// tRPC "function"
trpc.add.query({ a: 2, b: 3 });
```

It feels like calling a normal TypeScript function, but under the hood it's making an HTTP request.

### What happens when you call `sayHi`?

```
React
  │  trpc.sayHi.query()
  ▼
HTTP POST /trpc
  │
  ▼
Express
  │
  ▼
createExpressMiddleware
  │
  ▼
appRouter
  │
  ▼
sayHi()
  │
  ▼
returns "Hi"
  │
  ▼
React receives "Hi"
```

**Summary:** tRPC doesn't eliminate APIs — it changes how you define and consume them. Instead of manually designing REST endpoints, you expose TypeScript procedures, and tRPC handles the networking and type synchronization between client and server. That's why it's often described as making remote backend functions feel like local TypeScript function calls.

## Client Side

```ts
import "./App.css";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../server/app";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3000/trpc",
    }),
  ],
});

function App() {
  async function main() {
    const result = await client.sayHi.query();
    console.log(result);

    const result2 = await client.logToServer.mutate("Hi from client");
    console.log(result2);
  }

  main();

  return (
    <>
      <h1>Welcome to tRPC</h1>
    </>
  );
}

export default App;
```