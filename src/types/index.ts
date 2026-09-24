export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  description?: string;
  order: number;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageExample {
  input: string;
  output: string;
}

export interface MessageType {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  description?: string;
  icon?: string;
  systemInstruction: string;
  messageStructure: string;
  writingStyle: string;
  rules: string[];
  examples: MessageExample[];
  outputFormat: "plain_text" | "markdown";
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationHistory {
  id: string;
  userId: string;
  messageTypeId: string;
  messageTypeName: string;
  categoryName: string;
  input: string;
  output: string;
  modelUsed: string;
  tokensUsed?: number;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  provider: "openai" | "gemini";
  model: string;
  temperature: number;
  maxTokens: number;
  theme: "system" | "light" | "dark";
  signature?: string;
}

export interface GenerateRequest {
  messageTypeId: string;
  input: string;
  modelOverride?: string;
  temperatureOverride?: number;
}

export interface GenerateResponse {
  output: string;
  historyId: string;
  messageTypeName: string;
  modelUsed: string;
  tokensUsed?: number;
}
