import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogStats,
} from "../controllers/blogController";

const router = express.Router();

router.get("/stats", getBlogStats);
router.get("/", getBlogs);
router.post("/create", createBlog);
router.get("/:id", getBlogById);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
