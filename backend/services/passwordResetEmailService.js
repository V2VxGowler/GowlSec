import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendPasswordResetEmail(email, token) {

    const url = `https://www.gowlsec.org/reset-password?token=${token}`;


    await resend.emails.send({
        from: "noreply@gowlsec.org",
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        html: `
            <h2>Réinitialisation du mot de passe</h2>

            <p>
            Vous avez demandé à changer votre mot de passe.
            </p>

            <a href="${url}">
            Réinitialiser mon mot de passe
            </a>

            <p>
            Ce lien expire dans 1 heure.
            </p>
        `
    });
}