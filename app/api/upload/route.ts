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

    // Calculate expiration date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 1. Upload the image to Vercel Blob with an expiration date
    const blob = await put(filename, request.body, {
      access: "public",
      addRandomSuffix: true,
      expiresAt: expiresAt, // The file will be automatically deleted after 24 hours
    });

    // 2. Save the Code and URL to Postgres
    const client = await db.connect();
    
    // We include the 'created_at' explicitly if your table uses it, 
    // but the DB usually handles this automatically.
    await client.sql`
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