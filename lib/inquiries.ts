import { promises as fs } from "fs";
import path from "path";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  product: string;
  message: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "inquiries.json");

async function readAll(): Promise<Inquiry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Inquiry[];
  } catch {
    return [];
  }
}

export async function listInquiries(): Promise<Inquiry[]> {
  return readAll();
}

export async function addInquiry(
  input: Omit<Inquiry, "id" | "createdAt">,
): Promise<Inquiry> {
  const inquiries = await readAll();
  const inquiry: Inquiry = {
    ...input,
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  inquiries.push(inquiry);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
  return inquiry;
}
