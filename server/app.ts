import express from "express";
import cors from "cors"

//--------
import { initTRPC } from '@trpc/server';
const t = initTRPC.create();
//--------
import { createExpressMiddleware } from "@trpc/server/adapters/express";

const appRouter = t.router({
  // create action for this routes 
  // t.procedure.query => like we say when happen get for data
  // t.procedure.mutation => like we say when happen post or push for data
  sayHi:t.procedure.query(()=>{
    return "Hi"
  }),
  // .input allow us to make valdition for data
  logToServer:t.procedure.input(v => {
    if(typeof v === "string") return v
    throw new Error("Invalid input expected string")
  }).mutation(req => {
    console.log(`client say ${req.input}`)
    return true
  })

})

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use("/trpc",createExpressMiddleware({router:appRouter}))


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

export type AppRouter = typeof appRouter