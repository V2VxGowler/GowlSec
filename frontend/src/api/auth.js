export async function register({ username, email, password }) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
 
  const data = await response.json().catch(() => null);
 
  if (!response.ok) {
    throw new Error(data?.message || "Échec de l'inscription.");
  }
 
  return data;
}
 
export async function login({ email, password }) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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