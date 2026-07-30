/** Resolve API base URL for browser and server. */
export function getApiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  // Same-origin proxy (client/app/api/[...path]/route.ts) → no CORS, works on Vercel
  return "/api";
}

export function getBackendUrl(): string {
  return (
    process.env.API_URL?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    "http://localhost:5000"
  ).replace(/\/$/, "");
}
