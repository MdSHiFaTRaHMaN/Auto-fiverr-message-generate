import { NextResponse } from "next/server";
import { initializeUserData } from "@/lib/db/storage";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function POST() {
  try {
    const userId = DEFAULT_USER_ID;
    await initializeUserData(userId);
    return NextResponse.json({
      success: true,
      message: "Default categories and message types initialized successfully.",
    });
  } catch (error: any) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json(
      { error: "Failed to initialize seed data." },
      { status: 500 }
    );
  }
}
