import {t} from "../trpc.js"
import userRouter from "./users.js"

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
  }),
  users:userRouter,


})
export type AppRouter = typeof appRouter
export default appRouter