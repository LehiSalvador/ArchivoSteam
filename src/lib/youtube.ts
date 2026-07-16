// Importación de metadatos de YouTube (Data API v3). SOLO servidor: la API key
// nunca llega al navegador.
import "server-only";
import { serverEnv } from "@/lib/env.server";

export interface YoutubeChapter {
  t: number; // segundos
  label: string;
}

export interface YoutubeMeta {
  videoId: string;
  title: string;
  description: string;
  channel: string;
  channelId: string;
  publishedAt: string | null;
  thumbnailUrl: string;
  durationSeconds: number;
  viewCount: number | null;
  likeCount: number | null;
  chapters: YoutubeChapter[];
  raw: unknown;
}

/** Extrae el ID de video de una URL de YouTube (watch, youtu.be, shorts, embed). */
export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1, 12) || null;
    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch {
    /* no es URL */
  }
  const m = s.match(/[A-Za-z0-9_-]{11}/);
  return m ? m[0] : null;
}

/** ISO 8601 (PT#H#M#S) → segundos. */
export function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + +(m[3] || 0);
}

/** Extrae capítulos de la descripción (líneas con marca de tiempo). */
export function parseChaptersFromDescription(desc: string): YoutubeChapter[] {
  const out: YoutubeChapter[] = [];
  for (const line of desc.split("\n")) {
    const m = line.match(/(?:^|\s)(\d{1,2}):(\d{2})(?::(\d{2}))?\s*[-–—]?\s*(.+)$/);
    if (!m) continue;
    const [, a, b, c, label] = m;
    const t = c ? +a * 3600 + +b * 60 + +c : +a * 60 + +b;
    const clean = label.trim().replace(/^[-–—\s]+/, "");
    if (clean) out.push({ t, label: clean });
  }
  // Solo si empieza cerca de 0 y hay al menos 2 (heurística de capítulos reales).
  if (out.length >= 2 && out[0].t <= 5) return out;
  return [];
}

export type YoutubeResult =
  | { ok: true; meta: YoutubeMeta }
  | { ok: false; error: string };

export async function fetchYoutubeMeta(urlOrId: string): Promise<YoutubeResult> {
  if (!serverEnv.youtubeApiKey) return { ok: false, error: "YOUTUBE_API_KEY no configurada." };
  const id = parseYoutubeId(urlOrId);
  if (!id) return { ok: false, error: "No se pudo leer el ID del video desde la URL." };

  const api = new URL("https://www.googleapis.com/youtube/v3/videos");
  api.searchParams.set("part", "snippet,contentDetails,statistics,status");
  api.searchParams.set("id", id);
  api.searchParams.set("key", serverEnv.youtubeApiKey);

  let res: Response;
  try {
    res = await fetch(api, { cache: "no-store" });
  } catch {
    return { ok: false, error: "No se pudo contactar la API de YouTube." };
  }
  if (!res.ok) {
    return { ok: false, error: `YouTube respondió ${res.status}. Revisa la API key o la cuota.` };
  }
  const data = (await res.json()) as {
    items?: Array<{
      snippet?: {
        title?: string;
        description?: string;
        channelTitle?: string;
        channelId?: string;
        publishedAt?: string;
        thumbnails?: Record<string, { url?: string }>;
      };
      contentDetails?: { duration?: string };
      statistics?: { viewCount?: string; likeCount?: string };
      status?: { privacyStatus?: string };
    }>;
  };

  const item = data.items?.[0];
  if (!item) return { ok: false, error: "Video no encontrado, privado o eliminado." };

  const sn = item.snippet ?? {};
  const thumbs = sn.thumbnails ?? {};
  const thumb =
    thumbs.maxres?.url || thumbs.standard?.url || thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || "";
  const description = sn.description ?? "";

  return {
    ok: true,
    meta: {
      videoId: id,
      title: sn.title ?? "",
      description,
      channel: sn.channelTitle ?? "",
      channelId: sn.channelId ?? "",
      publishedAt: sn.publishedAt ?? null,
      thumbnailUrl: thumb,
      durationSeconds: parseIsoDuration(item.contentDetails?.duration ?? ""),
      viewCount: item.statistics?.viewCount ? +item.statistics.viewCount : null,
      likeCount: item.statistics?.likeCount ? +item.statistics.likeCount : null,
      chapters: parseChaptersFromDescription(description),
      raw: item,
    },
  };
}
