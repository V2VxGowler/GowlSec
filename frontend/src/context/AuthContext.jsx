import { createContext, useContext, useEffect, useState } from "react";
import { getSession, logout as logoutApi } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = getSession();

    if (session.user) {
      setUser(session.user);
    }
  }, []);

  function loginUser(data) {
    setUser(data.user);
  }

  function logout() {
    logoutApi();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}