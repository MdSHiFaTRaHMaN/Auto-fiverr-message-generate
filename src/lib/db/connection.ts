import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  let uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    return null;
  }

  // Clean up any stray unsupported query parameters
  if (uri.includes("?ai_message=") || uri.includes("&ai_message=")) {
    uri = uri.replace(/[?&]ai_message=[^&]*/g, "").replace(/\?$/, "");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        console.log("Connected to MongoDB successfully");
        return m;
      })
      .catch((err) => {
        console.warn(
          "MongoDB connection failed, will use local persistent storage:",
          err.message
        );
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

export function isMongoDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}
