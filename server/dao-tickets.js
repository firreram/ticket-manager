'use strict';

/* Data Access Object (DAO) module for accessing films data */

const db = require('./db');
const dayjs = require("dayjs");

const convertTicketFromDbRecord = (dbRecord) => {
  const ticket = {};
  ticket.id = dbRecord.id;
  ticket.category = dbRecord.category;
  ticket.timestamp = dbRecord.timestamp;
  ticket.userid = dbRecord.userid;
  ticket.username = dbRecord.username;
  ticket.title = dbRecord.title;
  ticket.body = dbRecord.body;
  ticket.status = dbRecord.status;
  return ticket;
}

const convertBlockFromDbRecord = (dbRecord) => {
  const block = {};
  block.id = dbRecord.id;
  block.ticketid = dbRecord.ticketid;
  block.userid = dbRecord.userid;
  block.username = dbRecord.username;
  block.body = dbRecord.body;
  block.timestamp = dbRecord.timestamp;
  return block;
}

// This function retrieves all the tickets in the database.
exports.listTickets = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT t.*, u.username FROM TICKETS t, USERS u WHERE t.userid = u.id';
      db.all(sql, [], (err, rows) => {
        if (err) { 
            reject(err); 
        }
        rows = rows.map((e) => { const ticket = convertTicketFromDbRecord(e);
          return ticket; });
        resolve(rows);
      });
    });
  };

// This function retrieves all the tickets in the database without the body.
exports.listTicketsWithoutBody = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT t.*, u.username FROM TICKETS t, USERS u WHERE t.userid = u.id';
    db.all(sql, [], (err, rows) => {
      if (err) { 
          reject(err); 
      }
      rows = rows.map((e) => { const ticket = convertTicketFromDbRecord(e);
        ticket.body = '';
        return ticket; });
      resolve(rows);
    });
  });
};

// This function retrieves a ticket from the database.
exports.getTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM TICKETS WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Ticket not found.' });
      } else {
        resolve(row);
      }
    });
  });
};

// This function retrieves the blocks from the database.
exports.getBlocks = (ticketid) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT b.*, u.username FROM BLOCKS b, USERS u WHERE b.userid = u.id AND b.ticketid=?';
    db.all(sql, [ticketid], (err, rows) => {
      if (err) {
        reject(err);
      }
      else {
        rows = rows.map((e) => { const block = convertBlockFromDbRecord(e);
          return block; });
        resolve(rows);
      }
    });
  });
};

exports.getBlock = (ticketid) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT b.*, u.username FROM BLOCKS b, USERS u WHERE b.userid = u.id AND b.ticketid=?';
    db.get(sql, [ticketid], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Block not found.' });
      } else {
        resolve(row);
      }
    });
  });
};


// This function creates a ticket in the database.
exports.createTicket = (ticket) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO TICKETS (category, timestamp, userid, title, body, status) VALUES(?, ?, ?, ?, ?, "open")';
    db.run(sql, [ticket.category, ticket.timestamp, ticket.userid, ticket.title, ticket.body], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object with the DB additional properties (i.e., unique id) to the client.
      resolve(exports.getTicket(this.lastID));
    });
  });
};

// This function creates a block in the database.
exports.createBlock = (block) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO BLOCKS (ticketid, userid, body, timestamp) VALUES(?, ?, ?, ?)';
    db.run(sql, [block.ticketid, block.userid, block.body, block.timestamp], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object with the DB additional properties (i.e., unique id) to the client.
      resolve(exports.getBlock(this.lastID));
    });
  });
};

// This function gets all the categories in the database.
exports.listCategories = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM CATEGORIES';
    db.all(sql, [], (err, rows) => {
      if (err) { 
          reject(err); 
      }
      resolve(rows);
    });
  });
};

// This function checks for the existence of a category in the database.
// This was done to ensure coherence in the db data.  
exports.getCategory = (category) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM CATEGORIES WHERE name=?';
    db.get(sql, [category], (err, rows) => {
      if (err) { 
          reject(err); 
      }
      if (rows == undefined) {
        console.log('Category not found.');
        resolve({ error: 'Category not found.'});
      }
      else {
        console.log(rows);
        resolve(rows);
      }
    });
  });
};

// This function updates a ticket status in the database.
exports.updateTicketStatus = (ticket, newStatus) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE TICKETS SET category=?, title=?, body=?, status=?, userid=?, timestamp=? WHERE id=?';
    db.run(sql, [ticket.category, ticket.title, ticket.body, newStatus, ticket.userid, ticket.timestamp, ticket.id], function (err) {
      if (err) {
        reject(err);
      }
      resolve(exports.getTicket(ticket.id));
    });
  });
};

// This function updates a ticket category in the database.
exports.updateTicketCategory = (ticket, newCategory) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE TICKETS SET category=?, title=?, body=?, status=?, userid=?, timestamp=? WHERE id=?';
    db.run(sql, [newCategory, ticket.title, ticket.body, ticket.status, ticket.userid, ticket.timestamp, ticket.id], function (err) {
      if (err) {
        reject(err);
      }
      resolve(exports.getTicket(ticket.id));
    });
  });
};
