import { Document } from "mongoose";

export interface BlogDocument {
  _id: { toString(): string };
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogResponse {
  id: string;
  title: string;
  content: string;
  tags: string[];
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export const computeReadingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const transformBlog = (blog: BlogDocument | Document): BlogResponse => {
  const doc = blog as BlogDocument;
  return {
    id: doc._id.toString(),
    title: doc.title,
    content: doc.content,
    tags: doc.tags ?? [],
    readingTime: computeReadingTime(doc.content),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};
