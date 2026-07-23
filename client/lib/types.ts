export interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogStats {
  totalPosts: number;
  totalWords: number;
  avgReadingTime: number;
}

export type BlogTone = "professional" | "casual" | "technical" | "storytelling";
export type BlogLength = "short" | "medium" | "long";

export interface GenerateBlogRequest {
  title: string;
  tone?: BlogTone;
  length?: BlogLength;
  prompt?: string;
}

export interface GenerateBlogResponse {
  content: string;
}

export interface ImproveBlogRequest {
  content: string;
  instruction?: string;
}

export interface CreateBlogPayload {
  title: string;
  content: string;
  tags?: string[];
}

export interface HealthResponse {
  status: string;
  database: string;
  storage: string;
  ai: boolean;
}
