import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const interview = await req.json();
    await db.collection("interviews").add(interview);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Error saving interview:", e);
    return NextResponse.json(
      { success: false, error: e?.toString() },
      { status: 500 }
    );
  }
}
