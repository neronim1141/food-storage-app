import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { appRouter, createContext } from "./src/server";
import ws from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import path from "path";
const buildPath = path.normalize(path.join(__dirname, "../public"));
const app = express();
const PORT = process.env.PORT ?? 3000;
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
app.use(express.static("public"));
const server = app.listen(PORT, () => {
  console.log("listening on port:", PORT);
});
app.get("/api/health", (_req, res) => res.send("OK"));

applyWSSHandler({
  wss: new ws.Server({ server, path: "/ws" }),
  router: appRouter,
  createContext
});

app.get("(/*)?", async (req, res, next) => {
  res.sendFile(path.join(buildPath, "index.html"));
});
