import { put } from "@vercel/blob";
import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const code = searchParams.get("code");

    if (!filename || !code || !request.body) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 1. Upload the image to Vercel Blob
    // We remove the hardcoded 'public' access to let it use the store default
    // or you can go to Vercel Dashboard and change store to 'Public'
    const blob = await put(filename, request.body, {
      access: "public", 
      addRandomSuffix: true, // Prevents overwriting if two people upload "image.png"
    });

    // 2. Save the Code and URL to Postgres
    const client = await db.connect();
    await client.sql`
      INSERT INTO pics (code, url)
      VALUES (${code}, ${blob.url});
    `;

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload error:", error);
    // This will help us see if it's still a permission issue
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}