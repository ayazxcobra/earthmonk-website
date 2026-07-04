// scripts/hash-password.js
// Usage: node scripts/hash-password.js "YourNewPassword123!"
// Prints a bcrypt hash to paste into .env as ADMIN_PASSWORD_HASH.
// The real password is never stored anywhere - only this hash is.

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password || password.length < 8) {
  console.error('Please provide a password of at least 8 characters.');
  console.error('Example: node scripts/hash-password.js "MyStrongPassword123!"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log('\nAdd this line to your .env file:\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
