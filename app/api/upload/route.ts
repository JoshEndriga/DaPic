import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const code = searchParams.get("code");

    if (!filename || !code || !request.body) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 1. Calculate expiration date (Exactly 24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 2. Upload to Vercel Blob
    // 'as any' bypasses the strict type check that caused your build to fail
    const blob = await put(filename, request.body, {
      access: "public",
      addRandomSuffix: true,
      expiresAt: expiresAt, 
    } as any);

    // 3. Save to Postgres using the Neon driver
    const sql = neon(process.env.POSTGRES_URL!);
    
    await sql`
      INSERT INTO pics (code, url)
      VALUES (${code}, ${blob.url});
    `;

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" }, 
      { status: 500 }
    );
  }
}