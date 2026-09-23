import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-3d41960e/health", (c) => {
  return c.json({ status: "ok" });
});

// Cargar colección desde Supabase
app.get("/make-server-3d41960e/data/:entity", async (c) => {
  const entity = c.req.param("entity");
  const data = await kv.get(entity);
  return c.json({ data: data ?? null });
});

// Guardar colección en Supabase
app.put("/make-server-3d41960e/data/:entity", async (c) => {
  const entity = c.req.param("entity");
  const body = await c.req.json();
  await kv.set(entity, body.data);
  return c.json({ ok: true });
});

Deno.serve(app.fetch);
