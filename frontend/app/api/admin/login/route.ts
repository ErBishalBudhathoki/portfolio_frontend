import crypto from "node:crypto";

import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session";
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

function isSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSessionToken = process.env.ADMIN_SESSION_TOKEN;

  if (!adminPassword || !adminSessionToken) {
    return NextResponse.json(
      { error: "Admin login is not configured." },
      { status: 503 }
    );
  }

  let password = "";

  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  if (!password || !isSafeEqual(password, adminPassword)) {
    return NextResponse.json(
      { error: "Invalid password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: adminSessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_DAY_IN_SECONDS,
    path: "/",
  });

  return response;
}
