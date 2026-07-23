import { Request, Response } from "express";
import { blogService } from "../services/blogService";

const getId = (req: Request): string => String(req.params.id);

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, tags } = req.body;

    if (!title?.trim() || !content?.trim()) {
      res.status(400).json({ message: "Title and content are required." });
      return;
    }

    const blog = await blogService.create({
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
    });
    res.status(201).json(blog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getBlogs = async (_req: Request, res: Response) => {
  try {
    const blogs = await blogService.getAll();
    res.json(blogs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await blogService.getById(getId(req));
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    res.json(blog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    const updates: { title?: string; content?: string; tags?: string[] } = {};

    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (tags !== undefined) updates.tags = tags;

    const blog = await blogService.update(getId(req), updates);

    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    res.json(blog);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const deleted = await blogService.delete(getId(req));

    if (!deleted) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    res.json({ message: "Blog deleted successfully", id: req.params.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getBlogStats = async (_req: Request, res: Response) => {
  try {
    const stats = await blogService.getStats();
    res.json(stats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
