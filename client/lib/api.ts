import axios from "axios";
import type {
  Blog,
  BlogStats,
  CreateBlogPayload,
  GenerateBlogRequest,
  GenerateBlogResponse,
  HealthResponse,
  ImproveBlogRequest,
} from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const getHealth = async (): Promise<HealthResponse> => {
  const res = await axios.get<HealthResponse>(
    API.replace("/api", "") + "/api/health"
  );
  return res.data;
};

export const getBlogs = async (): Promise<Blog[]> => {
  const res = await client.get<Blog[]>("/blogs");
  return res.data;
};

export const getBlogStats = async (): Promise<BlogStats> => {
  const res = await client.get<BlogStats>("/blogs/stats");
  return res.data;
};

export const getBlogById = async (id: string): Promise<Blog> => {
  const res = await client.get<Blog>(`/blogs/${id}`);
  return res.data;
};

export const createBlog = async (data: CreateBlogPayload): Promise<Blog> => {
  const res = await client.post<Blog>("/blogs/create", data);
  return res.data;
};

export const updateBlog = async (
  id: string,
  data: CreateBlogPayload
): Promise<Blog> => {
  const res = await client.put<Blog>(`/blogs/${id}`, data);
  return res.data;
};

export const deleteBlog = async (id: string): Promise<void> => {
  await client.delete(`/blogs/${id}`);
};

export const generateBlogContent = async (
  data: GenerateBlogRequest
): Promise<GenerateBlogResponse> => {
  const res = await client.post<GenerateBlogResponse>("/ai/generate", data, {
    timeout: 120_000,
  });
  return res.data;
};

export const improveBlogContent = async (
  data: ImproveBlogRequest
): Promise<GenerateBlogResponse> => {
  const res = await client.post<GenerateBlogResponse>("/ai/improve", data, {
    timeout: 120_000,
  });
  return res.data;
};
