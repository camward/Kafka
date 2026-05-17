import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { streamSSE } from "hono/streaming";
import { cors } from "hono/cors";
import { Kafka } from "kafkajs";

const app = new Hono();
app.use(cors({ origin: "*" }));

const users: string[] = [];
const subs = new Set<(data: string) => void>();

const notify = (d: string) => {
  users.push(d);
  subs.forEach((f) => f(d));
};

app.get("/sse", (c) =>
  streamSSE(c, async (stream) => {
    const send = (d: string) => stream.writeSSE({ data: d });
    subs.add(send);

    try {
      for (const u of users) await send(u);
      await new Promise(() => {});
    } finally {
      subs.delete(send);
    }
  })
);

const consumer = new Kafka({ brokers: [process.env.KAFKA_BROKER!] }).consumer({
  groupId: process.env.KAFKA_GROUP_ID!,
});
await consumer.connect();
await consumer.subscribe({
  topic: process.env.KAFKA_TOPIC!,
  fromBeginning: true,
});
await consumer.run({
  eachMessage: async ({ message }): Promise<any> =>
    message.value && notify(message.value.toString()),
});

serve({ fetch: app.fetch, port: 3002 }, (i) =>
  console.log(`Consumer is running on port: ${i.port}`)
);

process.on("SIGTERM", () => consumer.disconnect());
