import express from "express";

const router = express.Router();

const CACHE_DURATION = 60 * 60 * 1000;

let cache = {
  expiresAt: 0,
  events: [],
};

router.get("/events", async (req, res) => {
  const now = Date.now();

  if (
    cache.events.length > 0 &&
    cache.expiresAt > now
  ) {
    return res.json({
      success: true,
      source: "cache",
      events: cache.events,
    });
  }

  try {
    /*
     * On commence trois jours avant maintenant afin
     * d’inclure les CTF actuellement en cours.
     */
    const start = Math.floor(
      (now - 3 * 24 * 60 * 60 * 1000) / 1000
    );

    /*
     * Événements des 90 prochains jours.
     */
    const finish = Math.floor(
      (now + 90 * 24 * 60 * 60 * 1000) / 1000
    );

    const url =
      "https://ctftime.org/api/v1/events/" +
      `?limit=50&start=${start}&finish=${finish}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "GowlSec/1.0 (https://gowlsec.org)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `CTFtime a répondu avec le statut ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(
        "Réponse CTFtime invalide."
      );
    }

    const events = data
      /*
       * Retirer les événements déjà terminés.
       */
      .filter((event) => {
        const end = new Date(event.finish).getTime();
        return Number.isFinite(end) && end > now;
      })
      .sort(
        (first, second) =>
          new Date(first.start).getTime() -
          new Date(second.start).getTime()
      )
      /*
       * Une petite sélection, pas un clone de CTFtime.
       */
      .slice(0, 12)
      .map((event) => ({
        id: event.id,
        title: event.title,
        description:
          typeof event.description === "string"
            ? event.description
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 300)
            : "",
        start: event.start,
        finish: event.finish,
        format: event.format || "CTF",
        location: event.onsite
          ? event.location || "Sur place"
          : "En ligne",
        onsite: Boolean(event.onsite),
        weight: event.weight ?? 0,
        logo: event.logo || "",
        officialUrl: event.url || "",
        ctftimeUrl:
          event.ctftime_url ||
          `https://ctftime.org/event/${event.id}/`,
      }));

    cache = {
      events,
      expiresAt: now + CACHE_DURATION,
    };

    res.set(
      "Cache-Control",
      "public, max-age=900, s-maxage=3600"
    );

    return res.json({
      success: true,
      source: "ctftime",
      events,
    });
  } catch (error) {
    console.error(
      "Erreur pendant la récupération CTFtime :",
      error
    );

    /*
     * Si CTFtime tombe momentanément en panne,
     * utiliser l’ancien cache s’il existe.
     */
    if (cache.events.length > 0) {
      return res.json({
        success: true,
        source: "stale-cache",
        events: cache.events,
      });
    }

    return res.status(502).json({
      success: false,
      message:
        "Impossible de récupérer les événements CTFtime.",
    });
  }
});

export default router;