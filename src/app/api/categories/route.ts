import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/db/storage";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function GET() {
  try {
    const userId = DEFAULT_USER_ID;
    const categories = await getCategories(userId);
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, order, color, icon } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const userId = DEFAULT_USER_ID;
    const newCat = await createCategory(userId, {
      name: name.trim(),
      description: description?.trim() || "",
      order: typeof order === "number" ? order : undefined,
      color: color || "#10b981",
      icon: icon || "Folder",
    });

    return NextResponse.json({ success: true, data: newCat }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
  }
}
