import { useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { register } from "../api/auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function resetFields() {
    setUsername("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  }

 const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const cleanEmail = email.trim().toLowerCase();

    const result = await register({
      username: username.trim(),
      email: cleanEmail,
      password
    });

    // Sauvegarde uniquement si inscription réussie
    localStorage.setItem(
      "verification_email",
      cleanEmail
    );

    setSuccess(
      result?.message || "Compte créé avec succès."
    );

    resetFields();

  } catch (err) {

    setError(
      err?.message || "Une erreur est survenue lors de l'inscription."
    );

  } finally {

    setLoading(false);

  }
};

  

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 gowl-fade-in">
      <div className="space-y-1">
        <label htmlFor="register-email" className="text-xs font-medium text-[#8A93A3]">E-mail</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="root@gowlsec.fr"
          autoComplete="email"
          required
          disabled={loading}
          className="gowl-auth-input w-full px-3 py-2.5 rounded-xl text-sm bg-[#171B22CC] border border-[#242A34] text-[#EDEFF2] disabled:opacity-60"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="register-username" className="text-xs font-medium text-[#8A93A3]">Nom d'utilisateur</label>
        <input
          id="register-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ex : n0va_hxr"
          autoComplete="username"
          required
          disabled={loading}
          className="gowl-auth-input w-full px-3 py-2.5 rounded-xl text-sm bg-[#171B22CC] border border-[#242A34] text-[#EDEFF2] disabled:opacity-60"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="register-password" className="text-xs font-medium text-[#8A93A3]">Mot de passe</label>
        <div className="relative">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading}
            className="gowl-auth-input w-full px-3 py-2.5 pr-10 rounded-xl text-sm bg-[#171B22CC] border border-[#242A34] text-[#EDEFF2] disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="gowl-eye-btn absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-[#8A93A3]"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border p-3 flex items-start gap-2 border-[#FF4D5E44] bg-[#FF4D5E12]">
          <AlertTriangle size={16} className="shrink-0 text-[#FF4D5E]" />
          <p className="text-sm text-[#EDEFF2]">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border p-3 flex items-start gap-2 border-[#2ED9A344] bg-[#2ED9A312]">
          <CheckCircle2 size={16} className="shrink-0 text-[#2ED9A3]" />
          <p className="text-sm text-[#EDEFF2]">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: "linear-gradient(120deg, #5B6EF5 0%, #2ED9A3 100%)" }}
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Création…
          </>
        ) : (
          "Créer mon compte"
        )}
      </button>
    </form>
  );
}