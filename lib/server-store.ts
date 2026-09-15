import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { LabelJob, Order } from "./commerce";

const DATA_DIR = path.join(process.cwd(), ".data");

type NotifyRecord = {
  id: string;
  submissionId: string;
  notifiedAt: string;
  channel: "webhook" | "email-stub";
  via: "Andy/Kai";
  ok: boolean;
  detail: string;
};

type Persisted = {
  orders: Order[];
  labels: LabelJob[];
  notifications: NotifyRecord[];
};

const empty: Persisted = { orders: [], labels: [], notifications: [] };

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

function fileFor(name: keyof Persisted) {
  return path.join(DATA_DIR, `${name}.json`);
}

async function readList<K extends keyof Persisted>(name: K): Promise<Persisted[K]> {
  try {
    const raw = await readFile(fileFor(name), "utf8");
    const parsed = JSON.parse(raw) as Persisted[K];
    return Array.isArray(parsed) ? parsed : empty[name];
  } catch {
    return empty[name];
  }
}

async function writeList<K extends keyof Persisted>(name: K, value: Persisted[K]) {
  await ensureDir();
  await writeFile(fileFor(name), JSON.stringify(value, null, 2), "utf8");
}

export async function listOrders() {
  return readList("orders");
}

export async function saveOrder(order: Order) {
  const orders = await listOrders();
  if (order.stripeSessionId) {
    const existing = orders.find((item) => item.stripeSessionId === order.stripeSessionId);
    if (existing) return existing;
  }
  const next = [order, ...orders];
  await writeList("orders", next);
  return order;
}

export async function findOrderBySession(sessionId: string) {
  const orders = await listOrders();
  return orders.find((order) => order.stripeSessionId === sessionId);
}

export async function listLabels() {
  return readList("labels");
}

export async function saveLabel(job: LabelJob) {
  const labels = await listLabels();
  const next = [job, ...labels];
  await writeList("labels", next);
  return job;
}

export async function listNotifications() {
  return readList("notifications");
}

export async function saveNotification(record: NotifyRecord) {
  const notifications = await listNotifications();
  const next = [record, ...notifications];
  await writeList("notifications", next);
  return record;
}

export type { NotifyRecord };
