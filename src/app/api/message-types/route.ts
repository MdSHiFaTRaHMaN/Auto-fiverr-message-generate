import { NextRequest, NextResponse } from "next/server";
import { getMessageTypes, createMessageType } from "@/lib/db/storage";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const enabledOnly = searchParams.get("enabledOnly") === "true";

    const userId = DEFAULT_USER_ID;
    const types = await getMessageTypes(userId, categoryId, enabledOnly);

    return NextResponse.json({ success: true, data: types });
  } catch (error: any) {
    console.error("GET /api/message-types error:", error);
    return NextResponse.json(
      { error: "Failed to fetch message types." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      categoryId,
      description,
      icon,
      systemInstruction,
      messageStructure,
      writingStyle,
      rules,
      examples,
      outputFormat,
      enabled,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Message Type name is required." },
        { status: 400 }
      );
    }

    if (!categoryId?.trim()) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }

    const userId = DEFAULT_USER_ID;
    const newType = await createMessageType(userId, {
      name: name.trim(),
      categoryId: categoryId.trim(),
      description: description?.trim() || "",
      icon: icon || "MessageSquare",
      systemInstruction: systemInstruction?.trim() || "",
      messageStructure: messageStructure?.trim() || "",
      writingStyle: writingStyle?.trim() || "",
      rules: Array.isArray(rules) ? rules.filter((r: any) => typeof r === "string" && r.trim().length > 0) : [],
      examples: Array.isArray(examples)
        ? examples.filter((e: any) => e.input?.trim() && e.output?.trim())
        : [],
      outputFormat: outputFormat === "markdown" ? "markdown" : "plain_text",
      enabled: enabled !== undefined ? Boolean(enabled) : true,
    });

    return NextResponse.json({ success: true, data: newType }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/message-types error:", error);
    return NextResponse.json(
      { error: "Failed to create message type." },
      { status: 500 }
    );
  }
}
