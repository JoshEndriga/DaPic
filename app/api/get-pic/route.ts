import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  try {
    const client = await db.connect();
    const { rows } = await client.sql`
      SELECT url FROM pics WHERE code = ${code}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ url: rows[0].url });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}