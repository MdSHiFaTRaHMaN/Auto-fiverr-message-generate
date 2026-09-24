import { MessageType } from "@/types";

export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export function buildAIPrompt(
  messageType: MessageType,
  userInput: string,
  signature?: string
): BuiltPrompt {
  const sections: string[] = [];

  // 1. System Role & Core Purpose
  sections.push(`=== AI WORKFLOW: ${messageType.name.toUpperCase()} ===`);
  sections.push(`ROLE & PURPOSE:
You are an expert, top-rated Fiverr client communication specialist assisting a professional web and Shopify developer.
Your goal is to generate warm, friendly, polished, and human-sounding client messages that build trust and close deals on Fiverr.`);

  if (messageType.systemInstruction?.trim()) {
    sections.push(`WORKFLOW CONTEXT:\n${messageType.systemInstruction.trim()}`);
  }

  // 2. Multilingual & Input Translation Handling (Crucial for Banglish / mixed language notes)
  sections.push(`LANGUAGE & TRANSLATION DIRECTIVE:
- The user input may contain rough developer notes, raw client chat, English, Bengali, or "Banglish" (Bengali words written in English alphabet, e.g. "Ami sudhu tomake mone koriye dite chai ajke amader tomer project niye meeting korar kotha chilo. Tumi kokhon available thakbe...").
- AUTOMATIC TRANSLATION & POLISHING: Automatically detect the core intention of any Banglish, Bengali, or informal notes and rewrite them into fluent, clean, natural, and polite professional English.
- NEVER include Banglish words or raw draft notes in the final message.
- NEVER output phrases like "Situation reference:", "Client situation:", or quotes of the user's raw notes.`);

  // 3. Writing Style & Tone
  sections.push(`WRITING STYLE & TONE GUIDELINES:
- Warm, polite, and human-sounding (NOT stiff, bureaucratic, or robotic).
- Clear, concise, and easy to read.
- Avoid unnecessarily long explanations or artificial filler words.
- Natural paragraph spacing (1-2 sentences per paragraph for effortless readability on mobile and Fiverr app).
${messageType.writingStyle?.trim() ? `Specific tone requirements:\n${messageType.writingStyle.trim()}` : ""}`);

  // 4. Message Structure
  if (messageType.messageStructure?.trim()) {
    sections.push(`DESIRED MESSAGE STRUCTURE:\n${messageType.messageStructure.trim()}`);
  }

  // 5. Critical Rules
  const rulesList = [
    "Generate ONLY the final ready-to-send Fiverr message.",
    "Do NOT include preambles like 'Here is your message:' or 'Sure!'.",
    "Do NOT include explanations or mention that you are an AI.",
    "Do NOT invent dates, numbers, or promises not in the user's input.",
    "Comply strictly with Fiverr TOS: keep communication on Fiverr, no off-platform contact details.",
    ...(messageType.rules || []).map((r) => r.trim()).filter(Boolean),
  ];
  sections.push(`RULES & CONSTRAINTS:\n${rulesList.map((r, i) => `${i + 1}. ${r}`).join("\n")}`);

  // 6. Few-Shot Examples
  if (messageType.examples && messageType.examples.length > 0) {
    const formattedExamples = messageType.examples
      .map(
        (ex, idx) =>
          `[Reference Example ${idx + 1}]\nInput: ${ex.input.trim()}\nDesired Output:\n${ex.output.trim()}`
      )
      .join("\n\n");
    sections.push(`REFERENCE EXAMPLES (For tone and structure reference only):\n${formattedExamples}`);
  }

  // 7. Signature
  if (signature?.trim()) {
    sections.push(`DEVELOPER SIGNATURE:\nEnd the message with:\n${signature.trim()}`);
  }

  // 8. Output format constraint
  sections.push(`FINAL OUTPUT INSTRUCTION:
- Output only the final message body.
- Formatting: ${
    messageType.outputFormat === "markdown"
      ? "Clean markdown with bullet points where appropriate."
      : "Plain text with clean double newlines between paragraphs."
  }`);

  const systemPrompt = sections.join("\n\n--------------------\n\n");
  const userPrompt = `USER INPUT / SITUATION NOTES TO CONVERT INTO FIVERR MESSAGE:\n${userInput.trim()}`;

  return { systemPrompt, userPrompt };
}
