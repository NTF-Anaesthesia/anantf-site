// Usage: node tools/encrypt-mopex.mjs /absolute/path/guide-content.unlocked.json
// Read the password from stdin; never place it in arguments or a committed file.
import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes,pbkdf2Sync,createCipheriv} from 'node:crypto';
const input=process.argv[2];
if(!input)throw new Error('Provide the private guide JSON path.');
const password=readFileSync(0,'utf8').replace(/\r?\n$/,'');
if(!password)throw new Error('A password is required on stdin.');
const plaintext=readFileSync(input);const data=JSON.parse(plaintext);
if(!Array.isArray(data.chapters)||!data.chapters.length)throw new Error('Invalid guide data.');
const salt=randomBytes(16),iv=randomBytes(12),iterations=600000,key=pbkdf2Sync(password,salt,iterations,32,'sha256');
const cipher=createCipheriv('aes-256-gcm',key,iv);
const ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final(),cipher.getAuthTag()]);
writeFileSync(new URL('../mopex/handbook.enc.json',import.meta.url),JSON.stringify({version:1,algorithm:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations,salt:salt.toString('base64'),iv:iv.toString('base64'),ciphertext:ciphertext.toString('base64')})+'\n');key.fill(0);plaintext.fill(0);
console.log('Encrypted guide written. Do not commit the private source or password.');
