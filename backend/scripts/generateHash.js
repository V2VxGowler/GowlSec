import bcrypt from "bcrypt";

const hash = await bcrypt.hash("mot_de_passe_factice_unique", 12);

console.log(hash);
