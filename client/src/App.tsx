import './App.css'
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { mergedRouters } from "../../server/app"

const client = createTRPCProxyClient<mergedRouters>({
  links:[httpBatchLink({
    url:"http://localhost:3000/trpc"
  })]
})

function App() {

async function main() {
  const result = await client.sayHi.query();
  console.log(result);
  const result_2 = await client.logToServer.mutate("Hi from client");
  console.log(result_2);
  // const result_3 = await client.users.getUser.query();
  // we can use now 
  const result_3 = await client.getUser.query();
  console.log(result_3)
}
main()

  return (
    <>
      <h1>
        welcome to TRPC
      </h1>
    </>
  )
}

export default App
