import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { Database } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "tactix.json");

const emptyDb = (): Database => ({
  users: [],
  organizations: [],
  memberships: [],
  dataSources: [],
  conversations: [],
  skills: [],
  skillVersions: [],
  agentTestRuns: [],
  activities: [],
});

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDb(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(emptyDb(), null, 2), "utf8");
  }
}

export async function readDb(): Promise<Database> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as Database;
}

export async function writeDb(db: Database): Promise<void> {
  await ensureDb();
  const next = writeQueue.then(() =>
    fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8")
  );
  writeQueue = next.catch(() => undefined);
  await next;
}

export async function updateDb<T>(
  mutator: (db: Database) => T | Promise<T>
): Promise<T> {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}

export function id(prefix?: string): string {
  return prefix ? `${prefix}_${nanoid(10)}` : nanoid(12);
}

export function now(): string {
  return new Date().toISOString();
}
