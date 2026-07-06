import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../server/routers/index"

// httpBatchLink its help us make stop the same request
// diffrent time 
const client = createTRPCProxyClient<AppRouter>({
  links:[httpBatchLink({
    url:"http://localhost:3000/trpc"
  })]
})

async function main() {
  const result = await client.sayHi.query()
}

main()