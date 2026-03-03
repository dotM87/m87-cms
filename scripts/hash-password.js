const bcrypt = require("bcryptjs");

const args = process.argv.slice(2).filter(value => value !== "--");
const password = args[0];

if (!password) {
  console.error("Uso: pnpm hash:password -- <tu_password>");
  process.exit(1);
}

const rounds = 12;
const hash = bcrypt.hashSync(password, rounds);
console.log(hash);
