import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath, override: true });

export const env = (key: string): string =>
  (process.env[key] ?? "").trim().replace(/^["']|["']$/g, "");
