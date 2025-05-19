import { NextResponse } from "next/server";
import { pinata } from "@/app/utils/pinata";

export const dynamic = "force-dynamic";

export async function GET() {
  // If you're going to use auth you'll want to verify here
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 120 // seconds
    });
    return NextResponse.json({ url }, { status: 200 }); // Returns the signed upload URL
  } catch (error) {
    console.log("Error creating pinata upload signed URL", error);
    return NextResponse.json(
      { error: "Failed to create pinata upload signed URL" },
      { status: 500 }
    );
  }
}
