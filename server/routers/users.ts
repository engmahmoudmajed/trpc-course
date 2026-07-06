import {t} from "../trpc.js"

const userRouter = t.router({
  getUser:t.procedure.query(()=>{
    return {id:1 , name :"kyle"}
  }),

})
export type userRouter = typeof userRouter
export default userRouter