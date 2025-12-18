import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = String(req.query.url ?? "");
  if (!url) return res.status(400).json({ error: "Missing url" });

  const key = `tle:${Buffer.from(url).toString("base64")}`;
  const TTL = 60 * 10; // 10 min

  const cached = await redis.get<string>(key);
  if (cached) return res.json({ source: "cache", tleText: cached });

  const r = await fetch(url);
  if (!r.ok) return res.status(502).json({ error: "Fetch failed" });

  const text = await r.text();
  await redis.set(key, text, { ex: TTL });

  return res.json({ source: "origin", tleText: text });
}
