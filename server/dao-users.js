'use strict';

/* Data Access Object (DAO) module for accessing users data */

const db = require('./db');
const crypto = require('crypto');

// This function returns user's information given its id.
exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM USERS WHERE id=?';
      db.get(sql, [id], (err, row) => {
        if (err)
          reject(err);
        else if (row === undefined)
          resolve({ error: 'User not found.' });
        else {
          // By default, the local strategy looks for "username": 
          // for simplicity, instead of using "email", we create an object with that property.
          const user = { id: row.id, username: row.username, admin: row.admin }
          resolve(user);
        }
      });
    });
  };

// This function is used at log-in time to verify username and password.
exports.getUser = (username, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM USERS WHERE username=?';
      db.get(sql, [username], (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          resolve(false);
        }
        else {
          const user = { id: row.id, username: row.username, admin: row.admin };
          // Check the hashes with an async call, this operation may be CPU-intensive (and we don't want to block the server)
          crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) { //256 bit hash stored in DB
            if (err) reject(err);
            if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) // WARN: it is hash and not password (as in the week example) in the DB
              resolve(false);
            else
              resolve(user);
          });
        }
      });
    });
  };