import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

const SITE_URL = "https://www.archivostem.com";
export const dynamic = "force-dynamic";

async function rest(path: string): Promise<Record<string, unknown>[]> {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) return [];
  try {
    const res = await fetch(`${publicEnv.supabaseUrl}/rest/v1/${path}`, {
      headers: { apikey: publicEnv.supabaseAnonKey, Authorization: `Bearer ${publicEnv.supabaseAnonKey}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/biblioteca", "/recorridos", "/proyecto", "/participar"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const [archives, cities] = await Promise.all([
    rest("archives?select=slug,updated_at&status=eq.PUBLISHED&deleted_at=is.null&order=archive_number.desc&limit=1000"),
    rest("cities?select=id&order=name&limit=200"),
  ]);

  const archiveEntries: MetadataRoute.Sitemap = archives.map((a) => ({
    url: `${SITE_URL}/archivo/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at as string) : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const cityEntries: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${SITE_URL}/recorridos/${c.id}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...statics, ...archiveEntries, ...cityEntries];
}
