import { useAuth } from "../context/AuthContext";
import Register from "../pages/Register";

export default function ProtectedTab({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Register />;
  }

  return children;
}