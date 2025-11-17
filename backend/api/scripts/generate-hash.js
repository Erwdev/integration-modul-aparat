import * as bcrypt from 'bcrypt';

async function generateHash() {
  const password = '30062005';  // password to hash
  const saltRounds = 10;        // same as your auth service
  
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Generated Hash:', hash);
}


// Hash: $2b$10$g5qaldr0H0XhqDNjRYhgUuzchAf.ZgeWYxwnDYqtAeM82TxDWXXji
generateHash();