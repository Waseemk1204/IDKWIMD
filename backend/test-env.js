import fs from 'fs';
import dotenv from 'dotenv';

console.log('Current directory:', process.cwd());
console.log('Files in current directory:', fs.readdirSync('.'));
console.log('.env file exists:', fs.existsSync('.env'));

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log('.env content:', envContent);
}

dotenv.config({ path: '.env' });
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
