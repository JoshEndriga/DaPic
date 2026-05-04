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

    // 1. Calculate the cutoff time (24 hours ago from right now)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // 2. Query the database for a matching code that is NOT older than 24 hours
    const { rows } = await client.sql`
      SELECT url FROM pics 
      WHERE code = ${code} 
      AND created_at > ${twentyFourHoursAgo.toISOString()}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      // If the code is old or doesn't exist, we return a 404
      return NextResponse.json({ error: "Code expired or not found" }, { status: 404 });
    }

    return NextResponse.json({ url: rows[0].url });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}