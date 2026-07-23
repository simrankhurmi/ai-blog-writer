import Link from "next/link";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface SiteHeaderProps {
  showWriteButton?: boolean;
}

export function SiteHeader({ showWriteButton = true }: SiteHeaderProps) {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              MiniBlog
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mt-0.5">
              Gemini AI · Next.js
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showWriteButton && (
            <Link href="/create">
              <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/20 border-0 px-3 py-1">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Write Blog</span>
                <span className="sm:hidden">Write</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
