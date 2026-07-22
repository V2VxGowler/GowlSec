import express from "express";

const router = express.Router();
const CACHE_TTL_MS = 15 * 60 * 1000;
let cache = { expiresAt: 0, events: [] };

function mapEvent(event) {
  const format = event.format || (event.onsite ? "Sur place" : "En ligne");
  return {
    id: event.id,
    title: event.title || "CTF sans titre",
    description: event.description || "",
    start: event.start,
    finish: event.finish,
    format,
    location: event.location || (event.onsite ? "Sur place" : "En ligne"),
    participantCount: Number(event.participants || event.teams || 0) || 0,
    weight: Number(event.weight || 0) || 0,
    reward: event.prizes || "",
    officialUrl: event.url || "",
    ctftimeUrl: event.ctftime_url || `https://ctftime.org/event/${event.id}/`,
  };
}

router.get("/events", async (req, res) => {
  try {
    if (cache.expiresAt > Date.now() && cache.events.length > 0) {
      return res.json({ success: true, events: cache.events, cached: true });
    }

    const now = Math.floor(Date.now() / 1000);
    const start = now - 7 * 86400;
    const finish = now + 180 * 86400;
    const url = `https://ctftime.org/api/v1/events/?limit=100&start=${start}&finish=${finish}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "GowlSec/1.0 (contact: GowlSec@proton.me)",
      },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error(`CTFtime a répondu avec le statut ${response.status}.`);
    }

    const payload = await response.json();
    const events = (Array.isArray(payload) ? payload : [])
      .map(mapEvent)
      .filter((event) => event.id && event.start)
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    cache = { expiresAt: Date.now() + CACHE_TTL_MS, events };
    return res.json({ success: true, events, cached: false });
  } catch (error) {
    console.error("Erreur CTFtime :", error);
    if (cache.events.length > 0) {
      return res.json({
        success: true,
        events: cache.events,
        cached: true,
        stale: true,
      });
    }
    return res.status(502).json({
      success: false,
      events: [],
      message:
        "CTFtime est momentanément indisponible. Réessaie dans quelques minutes.",
    });
  }
});

export default router;
