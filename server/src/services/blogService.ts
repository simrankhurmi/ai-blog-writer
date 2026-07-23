import mongoose from "mongoose";
import Blog from "../models/Blog";
import { fileStore } from "../store/fileStore";
import { BlogResponse, transformBlog } from "../utils/transformBlog";

export type StoreMode = "mongodb" | "file";

let storeMode: StoreMode = "mongodb";

export const setStoreMode = (mode: StoreMode) => {
  storeMode = mode;
};

export const getStoreMode = (): StoreMode => storeMode;

const useMongo = () =>
  storeMode === "mongodb" && mongoose.connection.readyState === 1;

export const blogService = {
  async getAll(): Promise<BlogResponse[]> {
    if (useMongo()) {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      return blogs.map(transformBlog);
    }
    return fileStore.getAll();
  },

  async getById(id: string): Promise<BlogResponse | null> {
    if (useMongo()) {
      const blog = await Blog.findById(id);
      return blog ? transformBlog(blog) : null;
    }
    return fileStore.getById(id);
  },

  async create(data: {
    title: string;
    content: string;
    tags?: string[];
  }): Promise<BlogResponse> {
    if (useMongo()) {
      const blog = await Blog.create(data);
      return transformBlog(blog);
    }
    return fileStore.create(data);
  },

  async update(
    id: string,
    data: { title?: string; content?: string; tags?: string[] }
  ): Promise<BlogResponse | null> {
    if (useMongo()) {
      const blog = await Blog.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return blog ? transformBlog(blog) : null;
    }
    return fileStore.update(id, data);
  },

  async delete(id: string): Promise<boolean> {
    if (useMongo()) {
      const result = await Blog.findByIdAndDelete(id);
      return !!result;
    }
    return fileStore.delete(id);
  },

  async getStats() {
    if (useMongo()) {
      const blogs = await Blog.find();
      const totalWords = blogs.reduce(
        (sum, b) => sum + b.content.trim().split(/\s+/).filter(Boolean).length,
        0
      );
      const readingTimes = blogs.map((b) =>
        Math.max(1, Math.ceil(b.content.trim().split(/\s+/).filter(Boolean).length / 200))
      );
      return {
        totalPosts: blogs.length,
        totalWords,
        avgReadingTime:
          readingTimes.length > 0
            ? Math.round(readingTimes.reduce((a, b) => a + b, 0) / readingTimes.length)
            : 0,
      };
    }
    return fileStore.getStats();
  },
};
