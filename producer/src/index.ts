import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Kafka } from "kafkajs";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./db/schema.ts";

const app = new Hono();
app.use(cors({ origin: "*" }));

const db = drizzle(
  new Pool({
    host: process.env.POSTGRES_HOST!,
    port: Number(process.env.POSTGRES_PORT!),
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DB!,
  }),
  { schema: { users } }
);

const producer = new Kafka({ brokers: [process.env.KAFKA_BROKER!] }).producer();

app.post("/users", async (c) => {
  const { login } = await c.req.json<{ login: string }>();
  if (!login) return c.json({ error: "login required" }, 400);

  const [user] = await db.insert(users).values({ login }).returning();
  await producer.send({
    topic: process.env.KAFKA_TOPIC!,
    messages: [{ value: JSON.stringify(user) }],
  });
  return c.json(user, 201);
});

await producer.connect();

serve({ fetch: app.fetch, port: 3001 }, (i) =>
  console.log(`Producer is running on port: ${i.port}`)
);
