import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Palette de couleurs GowlSec — Crâne Cyber Violet ─────────────────────

const brandColors = {
  bg: "#050408",
  card: "#0c0914",
  cardBorder: "#1a1429",
  primary: "#a855f7",
  primaryHover: "#9333ea",
  primaryGlow: "rgba(168, 85, 247, 0.25)",
  text: "#f5f3ff",
  muted: "#c4b5fd",
  dim: "#8b7db8",
  divider: "#1e1833",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const logoUrl = "https://gowlsec.org/logo.png";

// ── Template HTML de base ────────────────────────────────────────────────

function baseTemplate({ title, subtitle, bodyContent, actionUrl, actionText, footerNote, token }) {
  return `
<!DOCTYPE html>
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 24px 16px !important; }
      .card { padding: 32px 24px !important; border-radius: 12px !important; }
      .logo { width: 80px !important; height: 80px !important; }
      .heading { font-size: 22px !important; }
      .subheading { font-size: 15px !important; }
      .body-text { font-size: 14px !important; }
      .btn { padding: 14px 28px !important; font-size: 15px !important; width: 100% !important; box-sizing: border-box !important; }
      .footer { padding: 0 16px !important; }
      .token-box { font-size: 18px !important; letter-spacing: 4px !important; }
    }
    @media only screen and (max-width: 400px) {
      .card { padding: 28px 20px !important; }
      .heading { font-size: 20px !important; }
    }
    @media (prefers-color-scheme: dark) {
      .email-wrapper { background-color: ${brandColors.bg} !important; }
      .card { background-color: ${brandColors.card} !important; border-color: ${brandColors.cardBorder} !important; }
    }
  </style>
</head>
<body class="email-wrapper" style="margin:0;padding:0;background-color:${brandColors.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:48px 20px;">

        <table role="presentation" class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <a href="https://gowlsec.org" target="_blank" style="text-decoration:none;">
                <img 
                  src="https://gowlsec.org/logo.png"
                  alt="GowlSec" 
                  class="logo"
                  width="96" 
                  height="96"
                  style="display:block;border:0;outline:none;width:96px;height:96px;"
                />
              </a>
            </td>
          </tr>

          <!-- Carte principale -->
          <tr>
            <td>
              <table role="presentation" class="card" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background-color:${brandColors.card};border:1px solid ${brandColors.cardBorder};border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:48px 40px;">

                    <!-- Ligne d'accent -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding-bottom:28px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="48" style="border-collapse:collapse;">
                            <tr>
                              <td height="3" style="background-color:${brandColors.primary};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Titre -->
                    <h1 class="heading" style="margin:0 0 12px;color:${brandColors.text};font-size:26px;font-weight:700;line-height:1.3;letter-spacing:-0.02em;">
                      ${title}
                    </h1>

                    <!-- Sous-titre -->
                    <p class="subheading" style="margin:0 0 28px;color:${brandColors.muted};font-size:16px;line-height:1.6;">
                      ${subtitle}
                    </p>

                    <!-- Divider -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td height="1" style="background-color:${brandColors.divider};font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>

                    <!-- Corps du message -->
                    <div class="body-text" style="padding-top:28px;color:${brandColors.muted};font-size:15px;line-height:1.7;">
                      ${bodyContent}
                    </div>

                    <!-- Bouton d'action -->
                    ${actionUrl ? `
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td align="center" style="padding-top:32px;padding-bottom:8px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                            <tr>
                              <td align="center" style="border-radius:10px;background-color:${brandColors.primary};" bgcolor="${brandColors.primary}">
                                <a 
                                  href="${actionUrl}" 
                                  class="btn"
                                  style="display:inline-block;padding:16px 36px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:0.02em;"
                                >
                                  ${actionText}
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <!-- Lien fallback -->
                    ${token ? `
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td align="center" style="padding-top:24px;">
                          <p style="margin:0 0 12px;color:${brandColors.dim};font-size:13px;">Ou copie ce lien dans ton navigateur :</p>
                          <div class="token-box" style="display:inline-block;padding:14px 20px;background-color:${brandColors.bg};border:1px solid ${brandColors.cardBorder};border-radius:8px;color:${brandColors.text};font-size:13px;word-break:break-all;line-height:1.5;">
                            <a href="${actionUrl}" style="color:${brandColors.primary};text-decoration:none;">${actionUrl}</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <!-- Note de sécurité -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding-top:32px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background-color:${brandColors.bg};border-radius:10px;">
                            <tr>
                              <td style="padding:16px 20px;">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                                  <tr>
                                    <td width="20" valign="top" style="padding-right:12px;">
                                      <span style="color:${brandColors.warning};font-size:16px;line-height:1;">&#9888;</span>
                                    </td>
                                    <td style="color:${brandColors.dim};font-size:13px;line-height:1.6;">
                                      ${footerNote}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" style="padding-top:32px;padding-bottom:16px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding:0 8px;">
                          <a href="https://gowlsec.org" target="_blank" style="color:${brandColors.dim};font-size:12px;text-decoration:none;">Site web</a>
                        </td>
                        <td style="color:${brandColors.divider};font-size:12px;">|</td>
                        <td style="padding:0 8px;">
                          <a href="https://gowlsec.org/contact" target="_blank" style="color:${brandColors.dim};font-size:12px;text-decoration:none;">Contact</a>
                        </td>
                        <td style="color:${brandColors.divider};font-size:12px;">|</td>
                        <td style="padding:0 8px;">
                          <a href="https://gowlsec.org/privacy" target="_blank" style="color:${brandColors.dim};font-size:12px;text-decoration:none;">Confidentialité</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <p style="margin:0;color:${brandColors.dim};font-size:12px;line-height:1.6;">
                      &copy; ${new Date().getFullYear()} <strong style="color:${brandColors.muted};">GowlSec</strong> &mdash; Cybersécurité proactive
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;color:${brandColors.dim};font-size:11px;line-height:1.5;">
                      Cet email a été envoyé automatiquement. Merci de ne pas y répondre.<br/>
                      GowlSec, plateforme de cybersécurité.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Email de vérification d'adresse email ────────────────────────────────

export async function sendVerificationEmail(email, token) {
  if (!isValidEmail(email)) {
    throw new Error("Adresse email invalide");
  }

  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const html = baseTemplate({
    title: "Vérifie ton adresse email",
    subtitle: "Bienvenue sur GowlSec — une dernière étape et ton compte sera actif.",
    bodyContent: `
      <p style="margin:0 0 16px;">
        Merci de rejoindre <strong style="color:${brandColors.text};">GowlSec</strong>. Pour sécuriser ton compte et accéder à l'ensemble des fonctionnalités de la plateforme, nous devons confirmer que cette adresse email t'appartient.
      </p>
      <p style="margin:0;">
        Clique sur le bouton ci-dessous pour finaliser ton inscription. Le lien est valable <strong style="color:${brandColors.text};">24 heures</strong>.
      </p>
    `,
    actionUrl: url,
    actionText: "Vérifier mon email",
    footerNote: "Si tu n'es pas à l'origine de cette inscription, ignore cet email. Aucune action ne sera entreprise sur ton compte.",
    token: true,
  });

  const { data, error } = await resend.emails.send({
    from: "GowlSec <contact@gowlsec.org>",
    to: email,
    subject: "Vérification de ton adresse email — GowlSec",
    html,
  });

  if (error) {
    console.error("Erreur Resend :", error);
    throw new Error("Impossible d'envoyer l'email de vérification");
  }

  return data;
}

// ── Email de réinitialisation de mot de passe ────────────────────────────

export async function sendPasswordResetEmail(email, token) {
  if (!isValidEmail(email)) {
    throw new Error("Adresse email invalide");
  }

  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = baseTemplate({
    title: "Réinitialisation de mot de passe",
    subtitle: "Nous avons reçu une demande de changement de mot de passe pour ton compte.",
    bodyContent: `
      <p style="margin:0 0 16px;">
        Une demande de réinitialisation a été initiée pour le compte associé à <strong style="color:${brandColors.text};">${email}</strong>. Si c'est bien toi, clique sur le bouton ci-dessous pour définir un nouveau mot de passe sécurisé.
      </p>
      <p style="margin:0 0 16px;">
        Ce lien expirera dans <strong style="color:${brandColors.text};">1 heure</strong> pour des raisons de sécurité.
      </p>
      <p style="margin:0;color:${brandColors.dim};font-size:13px;">
        Conseil : choisis un mot de passe d'au moins 12 caractères avec des majuscules, des chiffres et des symboles.
      </p>
    `,
    actionUrl: url,
    actionText: "Réinitialiser mon mot de passe",
    footerNote: "Si tu n'as pas demandé cette réinitialisation, ignore cet email ou contacte immédiatement notre équipe de sécurité. Ton compte reste sécurisé.",
    token: true,
  });

  const { data, error } = await resend.emails.send({
    from: "GowlSec <contact@gowlsec.org>",
    to: email,
    subject: "Réinitialisation de ton mot de passe — GowlSec",
    html,
  });

  if (error) {
    console.error("Erreur Resend :", error);
    throw new Error("Impossible d'envoyer l'email de réinitialisation");
  }

  return data;
}