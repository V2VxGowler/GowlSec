import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email, token) {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: "GowlSec <noreply@gowlsec.org>",
    to: email,
    subject: "Réinitialisation de votre mot de passe — GowlSec",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
        <body style="margin:0;padding:0;background:#050408;font-family:Arial,sans-serif;color:#f5f3ff;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td align="center" style="padding:48px 20px;">

                <!-- Logo et nom -->
                <table cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding-right:12px;">
                      <img
                        src="https://gowlsec.org/logo.png"
                        alt="GowlSec"
                        width="56"
                        height="56"
                        style="display:block;width:56px;height:56px;border:0;border-radius:10px;"
                      />
                    </td>

                    <td style="color:#f5f3ff;font-size:22px;font-weight:700;">
                      GowlSec
                    </td>
                  </tr>
                </table>

                <!-- Carte -->
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="max-width:600px;margin-top:32px;background:#0c0914;border:1px solid #1a1429;border-radius:16px;"
                >
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 16px;color:#f5f3ff;">
                        Réinitialisation du mot de passe
                      </h2>

                      <p style="color:#c4b5fd;line-height:1.6;">
                        Vous avez demandé à changer votre mot de passe.
                      </p>

                      <table cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td
                            bgcolor="#a855f7"
                            style="border-radius:10px;"
                          >
                            <a
                              href="${url}"
                              style="display:inline-block;padding:16px 28px;color:#ffffff;text-decoration:none;font-weight:600;"
                            >
                              Réinitialiser mon mot de passe
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin-top:24px;color:#8b7db8;font-size:13px;">
                        Ce lien expire dans 1 heure. Si vous n’avez pas demandé cette modification, ignorez cet e-mail.
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("Erreur Resend :", error);
    throw new Error("Impossible d’envoyer l’e-mail de réinitialisation");
  }

  return data;
}