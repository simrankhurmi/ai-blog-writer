"use client";

import { MarkdownContent } from "@/components/blog/markdown-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createBlog,
  generateBlogContent,
  improveBlogContent,
  updateBlog,
} from "@/lib/api";
import type { BlogLength, BlogTone } from "@/lib/types";
import {
  ArrowLeft,
  Eye,
  Loader2,
  Pencil,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface BlogFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    content: string;
    tags?: string[];
  };
}

const toneOptions: { value: BlogTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "technical", label: "Technical" },
  { value: "storytelling", label: "Storytelling" },
];

const lengthOptions: { value: BlogLength; label: string }[] = [
  { value: "short", label: "Short (~500 words)" },
  { value: "medium", label: "Medium (~1000 words)" },
  { value: "long", label: "Long (~1800 words)" },
];

export default function BlogForm({ mode, initialData }: BlogFormProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [tone, setTone] = useState<BlogTone>("professional");
  const [length, setLength] = useState<BlogLength>("medium");
  const [aiPrompt, setAiPrompt] = useState("");
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
  });

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const parseTags = (raw: string) =>
    raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateWithAI = async () => {
    if (!formData.title.trim()) {
      toast.error("Enter a title first");
      return;
    }
    setIsGenerating(true);
    try {
      const { content } = await generateBlogContent({
        title: formData.title,
        tone,
        length,
        prompt: aiPrompt || undefined,
      });
      setFormData((prev) => ({ ...prev, content }));
      toast.success("Draft generated with Gemini AI!");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Generation failed. Add GEMINI_API_KEY to server/.env";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveWithAI = async () => {
    if (!formData.content.trim()) {
      toast.error("Add content before improving");
      return;
    }
    setIsImproving(true);
    try {
      const { content } = await improveBlogContent({ content: formData.content });
      setFormData((prev) => ({ ...prev, content }));
      toast.success("Content improved with AI!");
    } catch {
      toast.error("Improve failed. Check GEMINI_API_KEY.");
    } finally {
      setIsImproving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: parseTags(tagsInput),
      };
      if (mode === "edit" && initialData?.id) {
        await updateBlog(initialData.id, payload);
        toast.success("Blog updated!");
        router.push(`/blog/${initialData.id}`);
      } else {
        const blog = await createBlog(payload);
        toast.success("Blog published!");
        router.push(`/blog/${blog.id}`);
      }
    } catch {
      toast.error("Failed to save. Is the server running?");
      setIsSubmitting(false);
    }
  };

  const backHref = mode === "edit" && initialData ? `/blog/${initialData.id}` : "/";
  const busy = isGenerating || isImproving || isSubmitting;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader showWriteButton={false} />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {mode === "edit" ? "Back to Blog" : "Back to Home"}
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini AI · Live Preview · Tags
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {mode === "create" ? "Create New Blog" : "Edit Blog"}
          </h1>
          <p className="text-muted-foreground">
            Generate, improve, preview, tag, and publish your article.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card className="glass-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle>Details</CardTitle>
              <CardDescription>Title, tags, and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="The Future of AI in Web Development"
                  value={formData.title}
                  onChange={handleChange}
                  className="h-11 bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated, max 5)</Label>
                <Input
                  id="tags"
                  placeholder="AI, Next.js, Tutorial"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="bg-background"
                />
              </div>
              {wordCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {wordCount} words · ~{readingTime} min read
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-emerald-400" />
                AI Tools
              </CardTitle>
              <CardDescription>Free Google Gemini generation & improvement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as BlogTone)}
                    className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    {toneOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Length</Label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value as BlogLength)}
                    className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    {lengthOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Textarea
                placeholder="Extra AI instructions (optional)..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={2}
                className="bg-background resize-none"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={busy}
                  className="gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 border-0"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Generate Draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImproveWithAI}
                  disabled={busy || !formData.content.trim()}
                  className="gap-2 border-border"
                >
                  {isImproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Improve Writing
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>Markdown editor with live preview</CardDescription>
                </div>
                <div className="flex rounded-lg border border-border overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTab("write")}
                    className={`px-3 py-1.5 flex items-center gap-1.5 transition ${activeTab === "write" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1.5 flex items-center gap-1.5 transition ${activeTab === "preview" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "write" ? (
                <>
                  <Textarea
                    name="content"
                    placeholder="Write or generate your blog content here..."
                    value={formData.content}
                    onChange={handleChange}
                    rows={18}
                    className="font-mono text-sm resize-y min-h-[360px] bg-background"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Markdown: ## headings · **bold** · lists
                  </p>
                </>
              ) : formData.content.trim() ? (
                <div className="min-h-[360px] rounded-lg border border-border p-5 bg-background/50">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">{formData.title || "Untitled"}</h2>
                  <MarkdownContent content={formData.content} />
                </div>
              ) : (
                <div className="min-h-[360px] flex items-center justify-center text-muted-foreground text-sm rounded-lg border border-dashed border-border">
                  Nothing to preview yet — write or generate content first.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3 flex-col sm:flex-row pt-1">
            <Button
              type="submit"
              size="lg"
              disabled={busy}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 border-0 h-11 px-8"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
              ) : (
                mode === "create" ? "Publish Blog" : "Update Blog"
              )}
            </Button>
            <Link href={backHref}>
              <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto h-11 border-border">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>

      <SiteFooter />
    </div>
  );
}
