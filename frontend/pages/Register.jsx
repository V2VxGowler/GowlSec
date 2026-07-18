import { register } from "../api/auth";

const handleSubmit = async (e) => {
  e.preventDefault();

  const result = await register({
    username,
    email,
    password
  });

  // afficher le résultat
};