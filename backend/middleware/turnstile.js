export async function verifyTurnstile(
  req,
  res,
  next
) {
  const secretKey =
    process.env.TURNSTILE_SECRET_KEY;

  const turnstileToken =
    typeof req.body?.turnstileToken === "string"
      ? req.body.turnstileToken.trim()
      : "";

  if (!secretKey) {
    console.error(
      "TURNSTILE_SECRET_KEY est absente."
    );

    return res.status(500).json({
      success: false,
      message:
        "La vérification anti-robot est indisponible.",
    });
  }

  if (!turnstileToken) {
    return res.status(400).json({
      success: false,
      message:
        "La vérification anti-robot est obligatoire.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    8000
  );

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: turnstileToken,
          remoteip: req.ip || "",
        }),
        signal: controller.signal,
      }
    );

    const result = await response.json();

    if (!result.success) {
      console.warn(
        "Échec Turnstile :",
        result["error-codes"]
      );

      return res.status(400).json({
        success: false,
        message:
          "La vérification anti-robot a échoué. Réessaie.",
      });
    }

    req.turnstile = result;
    return next();
  } catch (error) {
    console.error(
      "Erreur de vérification Turnstile :",
      error
    );

    return res.status(503).json({
      success: false,
      message:
        "Impossible de vérifier la protection anti-robot.",
    });
  } finally {
    clearTimeout(timeout);
  }
}