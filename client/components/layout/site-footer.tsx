export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MiniBlog · Next.js + Google Gemini</p>
        <p className="text-muted-foreground/70">Free AI · Search · Tags · Live Preview</p>
      </div>
    </footer>
  );
}
