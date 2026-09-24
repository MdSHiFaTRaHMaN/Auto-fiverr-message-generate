import { NextRequest, NextResponse } from "next/server";
import { getGenerationHistory, clearGenerationHistory } from "@/lib/db/storage";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const categoryName = searchParams.get("category") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const userId = DEFAULT_USER_ID;
    const history = await getGenerationHistory(userId, search, categoryName, limit);

    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    console.error("GET /api/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch generation history." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const userId = DEFAULT_USER_ID;
    await clearGenerationHistory(userId);
    return NextResponse.json({ success: true, message: "History cleared successfully." });
  } catch (error: any) {
    console.error("DELETE /api/history error:", error);
    return NextResponse.json(
      { error: "Failed to clear generation history." },
      { status: 500 }
    );
  }
}
