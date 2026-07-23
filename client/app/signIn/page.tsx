"use client";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <SiteHeader showWriteButton={false} />

      <div className="flex-1 max-w-md mx-auto px-4 py-20 w-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-violet-100 rounded-2xl flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Sign In</h1>
        <p className="text-slate-600 mb-8">
          Authentication is coming soon. For now, you can create and publish blogs without an account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Button>
          </Link>
          <Link href="/create">
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600 w-full sm:w-auto">
              Start Writing
            </Button>
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
