import { NextRequest, NextResponse } from "next/server";
import {
  getMessageTypeById,
  getUserSettings,
  addGenerationHistory,
  getCategories,
} from "@/lib/db/storage";
import { generateFiverrMessage } from "@/lib/ai/generator";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageTypeId, input, modelOverride, temperatureOverride } = body;

    if (!messageTypeId || typeof messageTypeId !== "string") {
      return NextResponse.json(
        { error: "Please select a valid Message Type." },
        { status: 400 }
      );
    }

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter or paste the situation / client message." },
        { status: 400 }
      );
    }

    const userId = DEFAULT_USER_ID;
    const messageType = await getMessageTypeById(messageTypeId, userId);

    if (!messageType) {
      return NextResponse.json(
        { error: "Selected Message Type was not found." },
        { status: 404 }
      );
    }

    if (!messageType.enabled) {
      return NextResponse.json(
        { error: "This Message Type is currently disabled. Please enable it to generate messages." },
        { status: 400 }
      );
    }

    const settings = await getUserSettings(userId);
    const categories = await getCategories(userId);
    const category = categories.find((c) => c.id === messageType.categoryId);
    const categoryName = category?.name || "General";

    // Call AI generator
    const result = await generateFiverrMessage(messageType, input, {
      model: modelOverride || settings.model,
      temperature: temperatureOverride ?? settings.temperature,
      maxTokens: settings.maxTokens,
      signature: settings.signature,
    });

    // Save to generation history
    const historyItem = await addGenerationHistory({
      userId,
      messageTypeId: messageType.id,
      messageTypeName: messageType.name,
      categoryName,
      input: input.trim(),
      output: result.output,
      modelUsed: result.modelUsed,
      tokensUsed: result.tokensUsed,
    });

    return NextResponse.json({
      success: true,
      data: {
        output: result.output,
        historyId: historyItem.id,
        messageTypeName: messageType.name,
        categoryName,
        modelUsed: result.modelUsed,
        tokensUsed: result.tokensUsed,
        isMockFallback: result.isMockFallback,
        fallbackReason: result.fallbackReason,
      },
    });
  } catch (error: any) {
    console.error("API /api/generate error:", error);
    return NextResponse.json(
      { error: error?.message || "Unable to generate the message right now. Please try again." },
      { status: 500 }
    );
  }
}
