import { NextResponse } from "next/server";
import { addInquiry, listInquiries } from "@/lib/inquiries";

export async function GET() {
  const inquiries = await listInquiries();
  return NextResponse.json({ inquiries, count: inquiries.length });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { name, email, product, message } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    !name.trim() ||
    !email.trim()
  ) {
    return NextResponse.json(
      { error: "Name and a valid email are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  const inquiry = await addInquiry({
    name: name.trim(),
    email: email.trim(),
    product: typeof product === "string" ? product : "",
    message: typeof message === "string" ? message.trim() : "",
  });

  return NextResponse.json({ ok: true, inquiry }, { status: 201 });
}
