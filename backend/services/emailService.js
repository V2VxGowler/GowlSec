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

  await resend.emails.send({
  from: "GowlSec <contact@gowlsec.org>",
  to: email,
  subject: "Vérification de votre adresse e-mail",
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;text-align:center;">
      
      <img src="https://gowlsec.org/logo.png" width="90" alt="GowlSec">

      <h1 style="color:#0F172A;">Bienvenue sur GowlSec</h1>

      <p>
        Merci de votre inscription.<br>
        Cliquez sur le bouton ci-dessous pour vérifier votre adresse e-mail.
      </p>

      <a href="${url}"
         style="
           display:inline-block;
           margin-top:20px;
           padding:14px 28px;
           background:#2563EB;
           color:white;
           text-decoration:none;
           border-radius:8px;
           font-weight:bold;
         ">
        Vérifier mon compte
      </a>

      <p style="margin-top:35px;color:#666;font-size:13px;">
        Si vous n'êtes pas à l'origine de cette demande,
        vous pouvez ignorer cet e-mail.
      </p>

    </div>
  `
});