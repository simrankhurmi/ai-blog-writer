import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { computeReadingTime } from "../utils/transformBlog";

export interface StoredBlog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "blogs.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

function readAll(): StoredBlog[] {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as StoredBlog[];
}

function writeAll(blogs: StoredBlog[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(blogs, null, 2), "utf-8");
}

export const fileStore = {
  getAll(): StoredBlog[] {
    return readAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string): StoredBlog | null {
    return readAll().find((b) => b.id === id) ?? null;
  },

  create(data: { title: string; content: string; tags?: string[] }): StoredBlog {
    const now = new Date().toISOString();
    const blog: StoredBlog = {
      id: randomUUID(),
      title: data.title,
      content: data.content,
      tags: data.tags ?? [],
      readingTime: computeReadingTime(data.content),
      createdAt: now,
      updatedAt: now,
    };
    const blogs = readAll();
    blogs.unshift(blog);
    writeAll(blogs);
    return blog;
  },

  update(
    id: string,
    data: { title?: string; content?: string; tags?: string[] }
  ): StoredBlog | null {
    const blogs = readAll();
    const index = blogs.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const updated: StoredBlog = {
      ...blogs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    if (data.content !== undefined) {
      updated.readingTime = computeReadingTime(data.content);
    }
    blogs[index] = updated;
    writeAll(blogs);
    return updated;
  },

  delete(id: string): boolean {
    const blogs = readAll();
    const filtered = blogs.filter((b) => b.id !== id);
    if (filtered.length === blogs.length) return false;
    writeAll(filtered);
    return true;
  },

  getStats() {
    const blogs = readAll();
    const totalWords = blogs.reduce(
      (sum, b) => sum + b.content.trim().split(/\s+/).filter(Boolean).length,
      0
    );
    return {
      totalPosts: blogs.length,
      totalWords,
      avgReadingTime:
        blogs.length > 0
          ? Math.round(blogs.reduce((s, b) => s + b.readingTime, 0) / blogs.length)
          : 0,
    };
  },
};
