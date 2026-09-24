import { NextRequest, NextResponse } from "next/server";
import { duplicateMessageType } from "@/lib/db/storage";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = DEFAULT_USER_ID;

    const duplicated = await duplicateMessageType(id, userId);
    if (!duplicated) {
      return NextResponse.json(
        { error: "Original message type not found to duplicate." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: duplicated, message: "Workflow duplicated successfully." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/message-types/[id]/duplicate error:", error);
    return NextResponse.json(
      { error: "Failed to duplicate message type." },
      { status: 500 }
    );
  }
}
