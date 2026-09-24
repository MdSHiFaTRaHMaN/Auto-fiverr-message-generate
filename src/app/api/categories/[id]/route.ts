import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/db/storage";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const userId = DEFAULT_USER_ID;

    const updated = await updateCategory(id, userId, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Category not found to update." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update category." },
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

    const result = await deleteCategory(id, userId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete category." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully." });
  } catch (error: any) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}
