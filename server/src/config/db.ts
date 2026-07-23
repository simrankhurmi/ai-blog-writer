import mongoose from "mongoose";
import { setStoreMode } from "../services/blogService";

export type DbStatus = "connected" | "fallback" | "disconnected";

let dbStatus: DbStatus = "disconnected";

export const getDbStatus = (): DbStatus => dbStatus;

const isValidMongoUri = (uri: string): boolean =>
  uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");

/** mongodb+srv URIs must not include port numbers — strip them if present */
export const sanitizeMongoUri = (uri: string): string => {
  if (!uri.startsWith("mongodb+srv://")) return uri;
  return uri.replace(/:\d+(?=\/|,|$)/g, "");
};

const connectDB = async () => {
  const rawUri = process.env.MONGO_URI?.trim();

  if (!rawUri) {
    console.warn("MONGO_URI not set — using local file storage (server/data/blogs.json)");
    dbStatus = "fallback";
    setStoreMode("file");
    return;
  }

  if (!isValidMongoUri(rawUri)) {
    dbStatus = "fallback";
    setStoreMode("file");
    console.warn("\n⚠️  MONGO_URI is invalid — using local file storage instead.");
    console.warn("   Must start with mongodb:// or mongodb+srv://");
    console.warn(
      "   Example: mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/blogDB\n"
    );
    return;
  }

  const uri = sanitizeMongoUri(rawUri);

  if (uri !== rawUri) {
    console.warn("ℹ️  Removed port numbers from mongodb+srv URI (not allowed with +srv).");
  }

  if (rawUri.includes("#") && !rawUri.includes("%23")) {
    console.warn(
      "⚠️  Password contains '#' — URL-encode it as %23 in MONGO_URI or connection will fail."
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    dbStatus = "connected";
    setStoreMode("mongodb");
    console.log("MongoDB Connected");
  } catch (error) {
    dbStatus = "fallback";
    setStoreMode("file");
    console.warn("\n⚠️  MongoDB connection failed — using local file storage instead.");
    console.warn("   Data will be saved to server/data/blogs.json");
    console.warn("   Common fixes:");
    console.warn("   1. Use cluster hostname: cluster0.xxxxx.mongodb.net (not shard hosts with :27017)");
    console.warn("   2. Atlas → Network Access → Add IP → 0.0.0.0/0");
    console.warn("   3. URL-encode special chars in password (# → %23, @ → %40)\n");
    console.warn("   Error:", (error as Error).message, "\n");
  }
};

export default connectDB;
