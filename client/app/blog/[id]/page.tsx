"use client";

import { MarkdownContent, formatDate } from "@/components/blog/markdown-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteBlog, getBlogById } from "@/lib/api";
import type { Blog } from "@/lib/types";
import { ArrowLeft, Clock, Copy, Edit, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BlogDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getBlogById(id)
      .then(setBlog)
      .catch(() => setBlog(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBlog(id);
      toast.success("Blog deleted");
      router.push("/");
    } catch {
      toast.error("Delete failed");
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    if (!blog) return;
    navigator
      .share({ title: blog.title, url: window.location.href })
      .catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
      });
  };

  const handleCopy = () => {
    if (!blog) return;
    navigator.clipboard.writeText(blog.content);
    toast.success("Markdown copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-4 py-12 w-full space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Blog not found</h1>
            <p className="text-muted-foreground mb-6">This post may have been deleted.</p>
            <Link href="/"><Button>Back Home</Button></Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <article className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          All articles
        </Link>

        <header className="mb-10 pb-8 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-3 h-3" />
              {formatDate(blog.createdAt, "long")}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
              {blog.readingTime} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight">
            {blog.title}
          </h1>

          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 border-border" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-border" onClick={handleCopy}>
              <Copy className="w-3.5 h-3.5" /> Copy MD
            </Button>
            <Link href={`/blog/${blog.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5 border-border">
                <Edit className="w-3.5 h-3.5" /> Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1.5" disabled={isDeleting}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this blog?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        <MarkdownContent content={blog.content} />

        <footer className="mt-12 pt-8 border-t border-border flex flex-wrap gap-3">
          <Link href="/">
            <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 border-0">
              <ArrowLeft className="w-4 h-4" /> All Blogs
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="outline" className="border-border">Write New</Button>
          </Link>
        </footer>
      </article>

      <SiteFooter />
    </div>
  );
}
