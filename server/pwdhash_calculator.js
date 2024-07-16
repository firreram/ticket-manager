//used to insert the password hash in the DB manually

const crypto = require('crypto');

const password = 'password';
const salt = 'francopollovive';
const keylen = 32;

crypto.scrypt(password, salt, keylen, (err, derivedKey) => {
    if (err) throw err;
    console.log('Derived key:', derivedKey.toString('hex'));
    console.log('Salt:', salt);
});