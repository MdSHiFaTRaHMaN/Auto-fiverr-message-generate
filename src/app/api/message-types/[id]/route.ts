import { NextRequest, NextResponse } from "next/server";
import {
  getMessageTypeById,
  updateMessageType,
  deleteMessageType,
} from "@/lib/db/storage";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = DEFAULT_USER_ID;
    const item = await getMessageTypeById(id, userId);

    if (!item) {
      return NextResponse.json(
        { error: "Message type not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error("GET /api/message-types/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch message type." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const userId = DEFAULT_USER_ID;

    const updated = await updateMessageType(id, userId, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Message type not found to update." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/message-types/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update message type." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = DEFAULT_USER_ID;

    const deleted = await deleteMessageType(id, userId);
    if (!deleted) {
      return NextResponse.json(
        { error: "Message type not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Message type deleted successfully." });
  } catch (error: any) {
    console.error("DELETE /api/message-types/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete message type." },
      { status: 500 }
    );
  }
}
