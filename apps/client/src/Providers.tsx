import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { FC, PropsWithChildren, useState } from "react";
import { trpc } from "./lib/trpc";
const queryClient = new QueryClient();
console.log(window.location.host);

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition(op) {
            return op.type === "subscription";
          },
          true: wsLink({
            client: createWSClient({
              url: `ws://${window.location.host}/ws`
            })
          }),
          false: httpBatchLink({
            url: `http://${window.location.host}/trpc`
          })
        })
      ]
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
