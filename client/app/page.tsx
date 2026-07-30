"use client";

import { BlogListSkeleton } from "@/components/blog/blog-skeleton";
import { formatDate, getExcerpt } from "@/components/blog/markdown-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBlogStats, getBlogs, getHealth } from "@/lib/api";
import type { Blog, BlogStats } from "@/lib/types";
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  PenLine,
  Plus,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SortOption = "newest" | "oldest" | "title";

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [storageMode, setStorageMode] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const [blogData, statsData, health] = await Promise.all([
          getBlogs(),
          getBlogStats(),
          getHealth().catch(() => null),
        ]);
        setBlogs(blogData);
        setStats(statsData);
        if (health) setStorageMode(health.storage);
      } catch {
        const isLocal =
          typeof window !== "undefined" &&
          (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1");
        setError(
          isLocal
            ? "Could not connect to API. Run: cd server && npm run dev"
            : "Could not reach the API backend. Deploy the server and set API_URL in Vercel environment variables, then redeploy."
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredBlogs = useMemo(() => {
    let result = [...blogs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.content.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.title.localeCompare(b.title);
    });
    return result;
  }, [blogs, search, sort]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border/60">
        <div className="hero-glow absolute inset-0" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-22 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-emerald-400 mb-6">
            <Zap className="w-3.5 h-3.5" />
            Free Gemini AI · Dark mode · Live preview
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground leading-tight mb-5 tracking-tight">
            Write smarter with{" "}
            <span className="gradient-text">AI-powered</span> blogs
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Generate drafts, improve writing, add tags, preview Markdown, and publish — a full demo-ready blog platform.
          </p>
          <Link href="/create">
            <Button
              size="lg"
              className="gap-2 h-12 px-8 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-emerald-500/25 border-0"
            >
              <PenLine className="w-5 h-5" />
              Start Writing
            </Button>
          </Link>
        </div>
      </section>

      {!isLoading && stats && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Posts", value: stats.totalPosts, icon: FileText },
              { label: "Total Words", value: stats.totalWords.toLocaleString(), icon: BookOpen },
              { label: "Avg Read", value: `${stats.avgReadingTime} min`, icon: Clock },
              { label: "Storage", value: storageMode || "—", icon: Sparkles },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
                <p className="text-2xl font-bold text-foreground capitalize">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Latest Articles</h2>
            <p className="text-muted-foreground">
              {isLoading ? "Loading..." : `${filteredBlogs.length} of ${blogs.length} posts`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search title, content, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-card border-border"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A–Z</option>
            </select>
            <Link href="/create">
              <Button variant="outline" className="gap-2 w-full sm:w-auto border-border">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <BlogListSkeleton />
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {search ? "No matching posts" : "No blogs yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search ? "Try a different search term." : "Create your first AI-generated post."}
            </p>
            {!search && (
              <Link href="/create">
                <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 border-0">
                  <Plus className="w-4 h-4" />
                  Create Blog
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBlogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.id}`} className="group">
                <article className="glass-card rounded-xl p-5 h-full hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(blog.createdAt)}
                    </span>
                    <span>·</span>
                    <span>{blog.readingTime} min read</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {getExcerpt(blog.content, 120)}
                  </p>
                  {blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                    Read article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
