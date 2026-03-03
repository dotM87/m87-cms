const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error("Uso: pnpm hash:password -- <tu_password>");
  process.exit(1);
}

const rounds = 12;
const hash = bcrypt.hashSync(password, rounds);
console.log(hash);
