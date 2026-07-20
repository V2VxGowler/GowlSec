const API_URL = import.meta.env.VITE_API_URL;

export async function register({ username, email, password }) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Échec de l'inscription.");
  }

  return data;
}

export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Échec de la connexion.");
  }

  return data;
}

export function saveSession(data) {
  localStorage.setItem("gowlsec_token", data.accessToken);
  localStorage.setItem("gowlsec_user", JSON.stringify(data.user));
}

export function getSession() {
  const token = localStorage.getItem("gowlsec_token");
  const user = localStorage.getItem("gowlsec_user");

  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
}

export function logout() {
  localStorage.removeItem("gowlsec_token");
  localStorage.removeItem("gowlsec_user");
}

export async function forgotPassword(email) {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Erreur lors de la demande.");
  }

  return data;
}


export async function resetPassword({ token, password }) {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Impossible de changer le mot de passe.");
  }

  return data;
}


export async function resendVerification(email) {
  const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Erreur.");
  }

  return data;
}