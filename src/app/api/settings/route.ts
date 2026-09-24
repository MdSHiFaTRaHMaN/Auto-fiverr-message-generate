import { NextRequest, NextResponse } from "next/server";
import { getUserSettings, updateUserSettings } from "@/lib/db/storage";
import { isMongoDbConfigured } from "@/lib/db/connection";
import { DEFAULT_USER_ID } from "@/lib/seed/defaultData";

export async function GET() {
  try {
    const userId = DEFAULT_USER_ID;
    const settings = await getUserSettings(userId);
    const hasApiKey = Boolean(process.env.OPENAI_API_KEY?.trim());
    const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
    const hasMongo = isMongoDbConfigured();

    return NextResponse.json({
      success: true,
      data: {
        settings,
        systemStatus: {
          isApiKeyConfigured: hasApiKey,
          isGeminiConfigured: hasGemini,
          isMongoConfigured: hasMongo,
          availableModels: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo", "gemini-1.5-flash", "gemini-2.0-flash"],
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = DEFAULT_USER_ID;

    const updated = await updateUserSettings(userId, {
      provider: body.provider || "openai",
      model: body.model,
      temperature: typeof body.temperature === "number" ? body.temperature : undefined,
      maxTokens: typeof body.maxTokens === "number" ? body.maxTokens : undefined,
      theme: body.theme,
      signature: body.signature,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings." },
      { status: 500 }
    );
  }
}
