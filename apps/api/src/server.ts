import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { z } from "zod";
import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";

const ee = new EventEmitter();
export const t = initTRPC.create();
export const appRouter = t.router({
  onAdd: t.procedure.subscription(() => {
    return observable(emit => {
      const onAdd = (data: any) => {
        emit.next(data);
      };
      ee.on("add", onAdd);
      return () => {
        ee.off("add", onAdd);
      };
    });
  }),
  add: t.procedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        text: z.string().min(1)
      })
    )
    .mutation(async opts => {
      const post = { ...opts.input };
      ee.emit("add", post);
      return post;
    })
});

export type AppRouter = typeof appRouter;
export function createContext(opts: CreateHTTPContextOptions | CreateWSSContextFnOptions) {
  return {};
}
export type Context = Awaited<ReturnType<typeof createContext>>;
