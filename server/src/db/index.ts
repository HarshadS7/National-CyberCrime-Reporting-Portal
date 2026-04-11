import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import * as schema from "./schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, "../../nerve.db");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
