"use client";

import BlogForm from "@/components/ui/blog-form";
import { getBlogById } from "@/lib/api";
import type { Blog } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const data = await getBlogById(id);
        setBlog(data);
      } catch {
        setBlog(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <SiteHeader showWriteButton={false} />
        <div className="max-w-4xl mx-auto px-4 py-16 w-full space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Blog not found</h1>
            <p className="text-slate-600 mb-6">Unable to load this post for editing.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <BlogForm
      mode="edit"
      initialData={{
        id: blog.id,
        title: blog.title,
        content: blog.content,
        tags: blog.tags,
      }}
    />
  );
}
