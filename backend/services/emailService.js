import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendVerificationEmail(email, token) {
  if (!isValidEmail(email)) {
    throw new Error("Adresse email invalide");
  }

  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: "GowlSec <contact@gowlsec.org>",
    to: email,
    subject: "Vérification de votre email",
    html: `
      <!doctype html>
      <html lang="fr">
        <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;text-align:center;">
            <div style="background:#111827;border-radius:16px;padding:36px;">
              <img
                src="https://gowlsec.org/logo.png"
                alt="GowlSec"
                width="100"
                style="display:block;margin:0 auto 24px;"
              />

              <h1 style="color:#ffffff;margin:0 0 16px;">
                Bienvenue sur GowlSec
              </h1>

              <p style="color:#cbd5e1;font-size:16px;line-height:1.6;">
                Clique sur le bouton ci-dessous pour vérifier ton adresse email.
              </p>

              <a
                href="${url}"
                style="
                  display:inline-block;
                  margin-top:20px;
                  padding:14px 26px;
                  background:#2563eb;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:bold;
                "
              >
                Vérifier mon email
              </a>

              <p style="color:#94a3b8;font-size:13px;margin-top:28px;">
                Si tu n’es pas à l’origine de cette inscription, ignore cet email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Erreur Resend :", error);
    throw new Error("Impossible d’envoyer l’email de vérification");
  }

  return data;
}