import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type {
  ConnectAccount,
  FinanceEvent,
  LabelJob,
  Order,
} from "./commerce";

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
  finance: FinanceEvent[];
  connect: ConnectAccount[];
};

const empty: Persisted = {
  orders: [],
  labels: [],
  notifications: [],
  finance: [],
  connect: [],
};

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
  if (order.stripePaymentIntentId) {
    const existing = orders.find(
      (item) => item.stripePaymentIntentId === order.stripePaymentIntentId,
    );
    if (existing) return existing;
  }
  const next = [order, ...orders];
  await writeList("orders", next);
  return order;
}

export async function updateOrder(id: string, patch: Partial<Order>) {
  const orders = await listOrders();
  const next = orders.map((order) => (order.id === id ? { ...order, ...patch } : order));
  await writeList("orders", next);
  return next.find((order) => order.id === id);
}

export async function findOrderById(id: string) {
  const orders = await listOrders();
  return orders.find((order) => order.id === id);
}

export async function findOrderBySession(sessionId: string) {
  const orders = await listOrders();
  return orders.find((order) => order.stripeSessionId === sessionId);
}

export async function findOrderByPaymentIntent(paymentIntentId: string) {
  const orders = await listOrders();
  return orders.find((order) => order.stripePaymentIntentId === paymentIntentId);
}

export async function findOrderByTransferGroup(transferGroup: string) {
  const orders = await listOrders();
  return orders.find((order) => order.transferGroup === transferGroup);
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

export async function listFinance() {
  return readList("finance");
}

export async function saveFinanceEvent(event: FinanceEvent) {
  const finance = await listFinance();
  if (event.stripeId) {
    const existing = finance.find((item) => item.stripeId === event.stripeId);
    if (existing) return existing;
  }
  const next = [event, ...finance];
  await writeList("finance", next);
  return event;
}

export async function listConnect() {
  return readList("connect");
}

export async function saveConnectAccount(account: ConnectAccount) {
  const connect = await listConnect();
  const next = [
    account,
    ...connect.filter((item) => item.id !== account.id && item.email !== account.email),
  ];
  await writeList("connect", next);
  return account;
}

export async function findConnectByEmail(email: string) {
  const connect = await listConnect();
  return connect.find((item) => item.email.toLowerCase() === email.toLowerCase());
}

export type { NotifyRecord };
