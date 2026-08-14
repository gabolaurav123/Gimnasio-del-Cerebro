import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Uso: npm run admin:hash -- 'una-contraseña-segura-de-12-caracteres'");
  process.exit(1);
}
console.log(await bcrypt.hash(password, 12));
