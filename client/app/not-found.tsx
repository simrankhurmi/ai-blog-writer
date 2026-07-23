import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <SiteHeader showWriteButton={false} />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-4">
            404
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
          <p className="text-slate-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/">
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-violet-600">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Write a Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
