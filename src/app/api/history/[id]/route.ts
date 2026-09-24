import { NextRequest, NextResponse } from "next/server";
import { deleteGenerationHistory } from "@/lib/db/storage";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = DEFAULT_USER_ID;

    const deleted = await deleteGenerationHistory(id, userId);
    if (!deleted) {
      return NextResponse.json(
        { error: "History record not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "History item deleted." });
  } catch (error: any) {
    console.error("DELETE /api/history/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete history item." },
      { status: 500 }
    );
  }
}
