import express from "express";
import cors from "cors"

//--------
import { t } from "./trpc.js";
import { mergedRouters } from "./routers/index.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use("/trpc",createExpressMiddleware({router:mergedRouters}))

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
export type mergedRouters = typeof mergedRouters

