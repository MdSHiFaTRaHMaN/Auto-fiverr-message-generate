import fs from "fs/promises";
import path from "path";
import { Category, MessageType, GenerationHistory, UserSettings } from "@/types";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MESSAGE_TYPES,
  DEFAULT_SETTINGS,
  DEFAULT_USER_ID,
} from "@/lib/seed/defaultData";
import { connectToDatabase } from "./connection";
import { CategoryModel } from "@/models/Category";
import { MessageTypeModel } from "@/models/MessageType";
import { GenerationHistoryModel } from "@/models/GenerationHistory";
import { UserSettingsModel } from "@/models/UserSettings";

interface LocalStore {
  categories: Category[];
  messageTypes: MessageType[];
  history: GenerationHistory[];
  settings: Record<string, UserSettings>;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

async function ensureLocalStoreFile(): Promise<LocalStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(STORE_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    const empty: LocalStore = {
      categories: [],
      messageTypes: [],
      history: [],
      settings: {},
    };
    await fs.writeFile(STORE_FILE, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }
}

async function writeLocalStore(store: LocalStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function generateId(): string {
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
}

export async function initializeUserData(userId: string = DEFAULT_USER_ID): Promise<void> {
  const db = await connectToDatabase();

  if (db) {
    const existingCat = await CategoryModel.countDocuments({ userId });
    if (existingCat === 0) {
      const categoryMap = new Map<string, string>();
      for (const cat of DEFAULT_CATEGORIES) {
        const created = await CategoryModel.create({
          userId,
          name: cat.name,
          description: cat.description,
          order: cat.order,
          color: cat.color,
          icon: cat.icon,
        });
        categoryMap.set(cat.name, created._id.toString());
      }

      for (const mt of DEFAULT_MESSAGE_TYPES) {
        const categoryId = categoryMap.get(mt.categoryName) || Array.from(categoryMap.values())[0];
        await MessageTypeModel.create({
          userId,
          categoryId,
          name: mt.name,
          description: mt.description,
          icon: mt.icon,
          systemInstruction: mt.systemInstruction,
          messageStructure: mt.messageStructure,
          writingStyle: mt.writingStyle,
          rules: mt.rules,
          examples: mt.examples,
          outputFormat: mt.outputFormat,
          enabled: mt.enabled,
        });
      }

      await UserSettingsModel.findOneAndUpdate(
        { userId },
        { ...DEFAULT_SETTINGS, userId },
        { upsert: true, new: true }
      );
    }
    return;
  }

  // Local JSON store fallback
  const store = await ensureLocalStoreFile();
  const userCategories = store.categories.filter((c) => c.userId === userId);

  if (userCategories.length === 0) {
    const categoryMap = new Map<string, string>();
    const now = new Date().toISOString();

    for (const cat of DEFAULT_CATEGORIES) {
      const id = generateId();
      categoryMap.set(cat.name, id);
      store.categories.push({
        id,
        userId,
        name: cat.name,
        description: cat.description,
        order: cat.order,
        color: cat.color,
        icon: cat.icon,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const mt of DEFAULT_MESSAGE_TYPES) {
      const catId = categoryMap.get(mt.categoryName) || store.categories[0]?.id;
      store.messageTypes.push({
        id: generateId(),
        userId,
        categoryId: catId,
        name: mt.name,
        description: mt.description,
        icon: mt.icon,
        systemInstruction: mt.systemInstruction,
        messageStructure: mt.messageStructure,
        writingStyle: mt.writingStyle,
        rules: mt.rules,
        examples: mt.examples,
        outputFormat: mt.outputFormat,
        enabled: mt.enabled,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (!store.settings[userId]) {
      store.settings[userId] = { ...DEFAULT_SETTINGS, userId };
    }

    await writeLocalStore(store);
  }
}

// ================= CATEGORIES =================
export async function getCategories(userId: string = DEFAULT_USER_ID): Promise<Category[]> {
  await initializeUserData(userId);
  const db = await connectToDatabase();

  if (db) {
    const docs = await CategoryModel.find({ userId }).sort({ order: 1, name: 1 }).lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      userId: d.userId,
      name: d.name,
      description: d.description,
      order: d.order,
      color: d.color,
      icon: d.icon,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));
  }

  const store = await ensureLocalStoreFile();
  return store.categories
    .filter((c) => c.userId === userId)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export async function createCategory(
  userId: string = DEFAULT_USER_ID,
  data: Partial<Category>
): Promise<Category> {
  const db = await connectToDatabase();
  const name = data.name?.trim() || "New Category";

  if (db) {
    const highest = await CategoryModel.findOne({ userId }).sort({ order: -1 });
    const order = data.order ?? (highest ? highest.order + 1 : 1);
    const doc = await CategoryModel.create({
      userId,
      name,
      description: data.description || "",
      order,
      color: data.color || "#10b981",
      icon: data.icon || "Folder",
    });
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      description: doc.description,
      order: doc.order,
      color: doc.color,
      icon: doc.icon,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  const store = await ensureLocalStoreFile();
  const userCats = store.categories.filter((c) => c.userId === userId);
  const highestOrder = userCats.reduce((max, c) => Math.max(max, c.order), 0);
  const now = new Date().toISOString();
  const newCat: Category = {
    id: generateId(),
    userId,
    name,
    description: data.description || "",
    order: data.order ?? highestOrder + 1,
    color: data.color || "#10b981",
    icon: data.icon || "Folder",
    createdAt: now,
    updatedAt: now,
  };
  store.categories.push(newCat);
  await writeLocalStore(store);
  return newCat;
}

export async function updateCategory(
  id: string,
  userId: string = DEFAULT_USER_ID,
  data: Partial<Category>
): Promise<Category | null> {
  const db = await connectToDatabase();

  if (db) {
    const doc = await CategoryModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      description: doc.description,
      order: doc.order,
      color: doc.color,
      icon: doc.icon,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  const store = await ensureLocalStoreFile();
  const idx = store.categories.findIndex((c) => c.id === id && c.userId === userId);
  if (idx === -1) return null;

  store.categories[idx] = {
    ...store.categories[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await writeLocalStore(store);
  return store.categories[idx];
}

export async function deleteCategory(
  id: string,
  userId: string = DEFAULT_USER_ID
): Promise<{ success: boolean; error?: string }> {
  const db = await connectToDatabase();

  if (db) {
    const activeTypes = await MessageTypeModel.countDocuments({ categoryId: id, userId });
    if (activeTypes > 0) {
      return {
        success: false,
        error: `Cannot delete category. There are ${activeTypes} message types linked to it. Please reassign or delete them first.`,
      };
    }
    const res = await CategoryModel.deleteOne({ _id: id, userId });
    return { success: res.deletedCount > 0 };
  }

  const store = await ensureLocalStoreFile();
  const linked = store.messageTypes.filter((m) => m.categoryId === id && m.userId === userId);
  if (linked.length > 0) {
    return {
      success: false,
      error: `Cannot delete category. There are ${linked.length} message types linked to it. Please reassign or delete them first.`,
    };
  }

  const initialLen = store.categories.length;
  store.categories = store.categories.filter((c) => !(c.id === id && c.userId === userId));
  if (store.categories.length !== initialLen) {
    await writeLocalStore(store);
    return { success: true };
  }
  return { success: false, error: "Category not found" };
}

// ================= MESSAGE TYPES =================
export async function getMessageTypes(
  userId: string = DEFAULT_USER_ID,
  categoryId?: string,
  enabledOnly: boolean = false
): Promise<MessageType[]> {
  await initializeUserData(userId);
  const db = await connectToDatabase();

  if (db) {
    const filter: Record<string, any> = { userId };
    if (categoryId) filter.categoryId = categoryId;
    if (enabledOnly) filter.enabled = true;

    const docs = await MessageTypeModel.find(filter).sort({ name: 1 }).lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      userId: d.userId,
      categoryId: d.categoryId,
      name: d.name,
      description: d.description,
      icon: d.icon,
      systemInstruction: d.systemInstruction,
      messageStructure: d.messageStructure,
      writingStyle: d.writingStyle,
      rules: d.rules || [],
      examples: d.examples || [],
      outputFormat: d.outputFormat || "plain_text",
      enabled: d.enabled,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));
  }

  const store = await ensureLocalStoreFile();
  return store.messageTypes
    .filter((m) => {
      if (m.userId !== userId) return false;
      if (categoryId && m.categoryId !== categoryId) return false;
      if (enabledOnly && !m.enabled) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMessageTypeById(
  id: string,
  userId: string = DEFAULT_USER_ID
): Promise<MessageType | null> {
  await initializeUserData(userId);
  const db = await connectToDatabase();

  if (db) {
    const doc = await MessageTypeModel.findOne({ _id: id, userId }).lean();
    if (!doc) return null;
    return {
      id: (doc as any)._id.toString(),
      userId: (doc as any).userId,
      categoryId: (doc as any).categoryId,
      name: (doc as any).name,
      description: (doc as any).description,
      icon: (doc as any).icon,
      systemInstruction: (doc as any).systemInstruction,
      messageStructure: (doc as any).messageStructure,
      writingStyle: (doc as any).writingStyle,
      rules: (doc as any).rules || [],
      examples: (doc as any).examples || [],
      outputFormat: (doc as any).outputFormat || "plain_text",
      enabled: (doc as any).enabled,
      createdAt: (doc as any).createdAt.toISOString(),
      updatedAt: (doc as any).updatedAt.toISOString(),
    };
  }

  const store = await ensureLocalStoreFile();
  const found = store.messageTypes.find((m) => m.id === id && m.userId === userId);
  return found || null;
}

export async function createMessageType(
  userId: string = DEFAULT_USER_ID,
  data: Partial<MessageType>
): Promise<MessageType> {
  const db = await connectToDatabase();

  if (db) {
    const doc = await MessageTypeModel.create({
      userId,
      categoryId: data.categoryId,
      name: data.name?.trim() || "Untitled Workflow",
      description: data.description || "",
      icon: data.icon || "MessageSquare",
      systemInstruction: data.systemInstruction || "",
      messageStructure: data.messageStructure || "",
      writingStyle: data.writingStyle || "",
      rules: data.rules || [],
      examples: data.examples || [],
      outputFormat: data.outputFormat || "plain_text",
      enabled: data.enabled ?? true,
    });
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      categoryId: doc.categoryId,
      name: doc.name,
      description: doc.description,
      icon: doc.icon,
      systemInstruction: doc.systemInstruction,
      messageStructure: doc.messageStructure,
      writingStyle: doc.writingStyle,
      rules: doc.rules,
      examples: doc.examples,
      outputFormat: doc.outputFormat,
      enabled: doc.enabled,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  const store = await ensureLocalStoreFile();
  const now = new Date().toISOString();
  const newType: MessageType = {
    id: generateId(),
    userId,
    categoryId: data.categoryId || store.categories[0]?.id || "cat_default",
    name: data.name?.trim() || "Untitled Workflow",
    description: data.description || "",
    icon: data.icon || "MessageSquare",
    systemInstruction: data.systemInstruction || "",
    messageStructure: data.messageStructure || "",
    writingStyle: data.writingStyle || "",
    rules: data.rules || [],
    examples: data.examples || [],
    outputFormat: data.outputFormat || "plain_text",
    enabled: data.enabled ?? true,
    createdAt: now,
    updatedAt: now,
  };
  store.messageTypes.push(newType);
  await writeLocalStore(store);
  return newType;
}

export async function updateMessageType(
  id: string,
  userId: string = DEFAULT_USER_ID,
  data: Partial<MessageType>
): Promise<MessageType | null> {
  const db = await connectToDatabase();

  if (db) {
    const doc = await MessageTypeModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      categoryId: doc.categoryId,
      name: doc.name,
      description: doc.description,
      icon: doc.icon,
      systemInstruction: doc.systemInstruction,
      messageStructure: doc.messageStructure,
      writingStyle: doc.writingStyle,
      rules: doc.rules,
      examples: doc.examples,
      outputFormat: doc.outputFormat,
      enabled: doc.enabled,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  const store = await ensureLocalStoreFile();
  const idx = store.messageTypes.findIndex((m) => m.id === id && m.userId === userId);
  if (idx === -1) return null;

  store.messageTypes[idx] = {
    ...store.messageTypes[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await writeLocalStore(store);
  return store.messageTypes[idx];
}

export async function duplicateMessageType(
  id: string,
  userId: string = DEFAULT_USER_ID
): Promise<MessageType | null> {
  const original = await getMessageTypeById(id, userId);
  if (!original) return null;

  return await createMessageType(userId, {
    categoryId: original.categoryId,
    name: `${original.name} (Copy)`,
    description: original.description,
    icon: original.icon,
    systemInstruction: original.systemInstruction,
    messageStructure: original.messageStructure,
    writingStyle: original.writingStyle,
    rules: [...original.rules],
    examples: original.examples.map((e) => ({ ...e })),
    outputFormat: original.outputFormat,
    enabled: true,
  });
}

export async function deleteMessageType(
  id: string,
  userId: string = DEFAULT_USER_ID
): Promise<boolean> {
  const db = await connectToDatabase();

  if (db) {
    const res = await MessageTypeModel.deleteOne({ _id: id, userId });
    return res.deletedCount > 0;
  }

  const store = await ensureLocalStoreFile();
  const initialLen = store.messageTypes.length;
  store.messageTypes = store.messageTypes.filter((m) => !(m.id === id && m.userId === userId));
  if (store.messageTypes.length !== initialLen) {
    await writeLocalStore(store);
    return true;
  }
  return false;
}

// ================= GENERATION HISTORY =================
export async function getGenerationHistory(
  userId: string = DEFAULT_USER_ID,
  search?: string,
  categoryName?: string,
  limit: number = 50
): Promise<GenerationHistory[]> {
  const db = await connectToDatabase();

  if (db) {
    const query: Record<string, any> = { userId };
    if (categoryName && categoryName !== "All") {
      query.categoryName = categoryName;
    }
    if (search?.trim()) {
      const rgx = new RegExp(search.trim(), "i");
      query.$or = [{ messageTypeName: rgx }, { input: rgx }, { output: rgx }];
    }

    const docs = await GenerationHistoryModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return docs.map((d: any) => ({
      id: d._id.toString(),
      userId: d.userId,
      messageTypeId: d.messageTypeId,
      messageTypeName: d.messageTypeName,
      categoryName: d.categoryName,
      input: d.input,
      output: d.output,
      modelUsed: d.modelUsed,
      tokensUsed: d.tokensUsed,
      createdAt: d.createdAt.toISOString(),
    }));
  }

  const store = await ensureLocalStoreFile();
  let list = store.history.filter((h) => h.userId === userId);

  if (categoryName && categoryName !== "All") {
    list = list.filter((h) => h.categoryName.toLowerCase() === categoryName.toLowerCase());
  }

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (h) =>
        h.messageTypeName.toLowerCase().includes(q) ||
        h.input.toLowerCase().includes(q) ||
        h.output.toLowerCase().includes(q)
    );
  }

  return list
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function addGenerationHistory(
  data: Omit<GenerationHistory, "id" | "createdAt">
): Promise<GenerationHistory> {
  const db = await connectToDatabase();

  if (db) {
    const doc = await GenerationHistoryModel.create({
      userId: data.userId,
      messageTypeId: data.messageTypeId,
      messageTypeName: data.messageTypeName,
      categoryName: data.categoryName,
      input: data.input,
      output: data.output,
      modelUsed: data.modelUsed,
      tokensUsed: data.tokensUsed,
    });
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      messageTypeId: doc.messageTypeId,
      messageTypeName: doc.messageTypeName,
      categoryName: doc.categoryName,
      input: doc.input,
      output: doc.output,
      modelUsed: doc.modelUsed,
      tokensUsed: doc.tokensUsed,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  const store = await ensureLocalStoreFile();
  const item: GenerationHistory = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  store.history.unshift(item);
  // Cap at 200 items in local file store
  if (store.history.length > 200) {
    store.history = store.history.slice(0, 200);
  }
  await writeLocalStore(store);
  return item;
}

export async function deleteGenerationHistory(
  id: string,
  userId: string = DEFAULT_USER_ID
): Promise<boolean> {
  const db = await connectToDatabase();

  if (db) {
    const res = await GenerationHistoryModel.deleteOne({ _id: id, userId });
    return res.deletedCount > 0;
  }

  const store = await ensureLocalStoreFile();
  const init = store.history.length;
  store.history = store.history.filter((h) => !(h.id === id && h.userId === userId));
  if (store.history.length !== init) {
    await writeLocalStore(store);
    return true;
  }
  return false;
}

export async function clearGenerationHistory(
  userId: string = DEFAULT_USER_ID
): Promise<boolean> {
  const db = await connectToDatabase();

  if (db) {
    await GenerationHistoryModel.deleteMany({ userId });
    return true;
  }

  const store = await ensureLocalStoreFile();
  store.history = store.history.filter((h) => h.userId !== userId);
  await writeLocalStore(store);
  return true;
}

// ================= USER SETTINGS =================
export async function getUserSettings(userId: string = DEFAULT_USER_ID): Promise<UserSettings> {
  const db = await connectToDatabase();

  if (db) {
    const doc = await UserSettingsModel.findOne({ userId }).lean();
    if (doc) {
      return {
        userId: (doc as any).userId,
        provider: (doc as any).provider,
        model: (doc as any).model,
        temperature: (doc as any).temperature,
        maxTokens: (doc as any).maxTokens,
        theme: (doc as any).theme,
        signature: (doc as any).signature,
      };
    }
  }

  const store = await ensureLocalStoreFile();
  if (store.settings[userId]) {
    return store.settings[userId];
  }

  const defaultConf: UserSettings = {
    ...DEFAULT_SETTINGS,
    userId,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  };
  store.settings[userId] = defaultConf;
  await writeLocalStore(store);
  return defaultConf;
}

export async function updateUserSettings(
  userId: string = DEFAULT_USER_ID,
  data: Partial<UserSettings>
): Promise<UserSettings> {
  const db = await connectToDatabase();

  if (db) {
    const doc = await UserSettingsModel.findOneAndUpdate(
      { userId },
      { $set: data },
      { upsert: true, new: true }
    ).lean();
    return {
      userId: (doc as any).userId,
      provider: (doc as any).provider,
      model: (doc as any).model,
      temperature: (doc as any).temperature,
      maxTokens: (doc as any).maxTokens,
      theme: (doc as any).theme,
      signature: (doc as any).signature,
    };
  }

  const store = await ensureLocalStoreFile();
  const current = store.settings[userId] || { ...DEFAULT_SETTINGS, userId };
  const updated: UserSettings = { ...current, ...data };
  store.settings[userId] = updated;
  await writeLocalStore(store);
  return updated;
}
