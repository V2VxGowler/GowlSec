import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendVerificationEmail(email, token) {
  if (!isValidEmail(email)) {
    throw new Error("Adresse email invalide");
  }

  const url = `https://www.gowlsec.org/verify-email?token=${token}`;

  await resend.emails.send({
    from: "noreply@gowlsec.org",
    to: email,
    subject: "Vérification de votre email",
    html: `
        <h2>Bienvenue sur GowlSec</h2>
        <p>Clique ici pour vérifier ton email :</p>

        <a href="${url}">
            Vérifier mon email
        </a>
    `
});
}