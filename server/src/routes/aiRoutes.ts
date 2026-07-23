import express from "express";
import { generateBlogContent, improveBlogContent } from "../controllers/aiController";

const router = express.Router();

router.post("/generate", generateBlogContent);
router.post("/improve", improveBlogContent);

router.get("/generate", (_req, res) => {
  res.status(405).json({
    message: "Use POST with JSON body: { title, tone?, length?, prompt? }",
    example: { title: "My Blog Title", tone: "professional", length: "short" },
  });
});

export default router;
