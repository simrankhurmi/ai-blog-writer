import "./config/env";
import express from "express";
import cors from "cors";
import connectDB, { getDbStatus } from "./config/db";
import blogRoutes from "./routes/blogRoutes";
import aiRoutes from "./routes/aiRoutes";
import { getStoreMode } from "./services/blogService";
import {
  getActiveProvider,
  getAiConfigError,
  isValidGeminiKey,
  isValidGroqKey,
} from "./services/aiService";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectDB();

app.get("/", (_req, res) => {
  res.send("MiniBlog API is running");
});

app.get("/api/health", (_req, res) => {
  const provider = getActiveProvider();
  res.json({
    status: "ok",
    database: getDbStatus(),
    storage: getStoreMode(),
    ai: !!provider,
    aiProvider: provider ?? "none",
    aiError: getAiConfigError() ?? undefined,
    hasGemini: isValidGeminiKey(),
    hasGroq: isValidGroqKey(),
  });
});

app.use("/api/blogs", blogRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  const provider = getActiveProvider();
  if (provider) {
    console.log(`✅ AI provider: ${provider}`);
  } else {
    console.warn(`\n⚠️  ${getAiConfigError()}\n`);
  }
});
