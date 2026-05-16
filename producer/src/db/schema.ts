import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("KafkaUsers", {
  id: serial("id").primaryKey(),
  login: varchar("login", { length: 50 }).notNull().unique(),
});
