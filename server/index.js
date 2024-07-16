'use strict';
/*** Importing modules ***/
const dayjs = require('dayjs');
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const { check, validationResult, oneOf } = require('express-validator'); // validation middleware
const cors = require('cors');

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = '9c0D949A6288gta0912joGiiroo6iG4oiF6i6m9Ddwllc0xRqd325wmpfsRr';
const expireTime = 900; //seconds=15 minutes (jwt expiration time)

const ticketDao = require('./dao-tickets'); // module for accessing the films table in the DB
const userDao = require('./dao-users'); // module for accessing the user table in the DB

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());


/** Set up and enable Cross-Origin Resource Sharing (CORS) **/

 const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
 };

app.use(cors(corsOptions));
// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "done, I've changed it :)",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: app.get('env') === 'production' ? true : false },
}));


app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

/***----------------------------- APIs ------------------------------------***/

// Get all the tickets in the database with or without body depending on the logged user
app.get('/api/tickets', (req, res) => {
  if(req.isAuthenticated()) {
    console.log('authorized');
    ticketDao.listTickets()
      .then(tickets => res.json(tickets))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
  else {
    ticketDao.listTicketsWithoutBody() //body is empty to non logged in users
      .then(tickets => res.json(tickets))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }}
);

//non logged in user do not need the category list
app.get('/api/categories', isLoggedIn,
  (req, res) => {
    ticketDao.listCategories()
      .then(categories => res.json(categories))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);

//get all blocks for a ticket
app.get('/api/blocks/:id', isLoggedIn,
  (req, res) => {
    ticketDao.getBlocks(req.params.id)
      .then(blocks => {
        if (blocks.error)
          res.status(500).json(blocks);
        else
          res.json(blocks);
      })
      .catch((err) => {res.status(500).json(err)}); // always return a json and an error message
  }
);

// Push a new ticket into the database
// The category is checked before pushing the ticket
// The DBMS will check the category as well as it is constrained by a foreign key
app.post('/api/tickets', isLoggedIn,
  //insert full dayjs timestamp server side, the timestamp is assigned at loading time
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(500).json( errors.errors ); // error message is sent back as a json with the error info
    }
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
    //status default open from dao and DBMS
    const ticket = {
      title: req.body.title,
      category: req.body.category,
      userid: req.user.id, // the user is logged in, the id is in the session
      timestamp: timestamp,
      body: req.body.body,
    };

    // Check if title or body are empty
    if (ticket.title==='' || ticket.body==='') {
      return res.status(422).json({ error: 'Title and body cannot be empty' });
    }

    try {
      const user = await userDao.getUserById(req.user.id);
      if (user.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(500).json(user);
      const category = await ticketDao.getCategory(ticket.category);
      if (category.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
              return res.status(500).json(category);
            
      const result = await ticketDao.createTicket(ticket); //the DB constraints will check the category and the user
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Database error during the creation of new ticket: ${err}` }); 
    }
  }
);

app.post('/api/blocks', isLoggedIn,
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(500).json( errors.errors ); // error message is sent back as a json with the error info
    }
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const block = {
      ticketid: req.body.ticketid,
      userid: req.user.id, // the user is logged in, the id is in the session
      timestamp: timestamp,
      body: req.body.body,
    };

    if (block.body==='') {
      return res.status(422).json({ error: 'Title and body cannot be empty' });
    }

    try {
      const user = await userDao.getUserById(req.user.id);
      if (user.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(404).json(user);
      
      const ticket = await ticketDao.getTicket(block.ticketid);
      if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(404).json(ticket);
      
      if (ticket.status === 'closed') {
        return res.status(500).json({ error: 'Ticket is closed' });
      }

      const result = await ticketDao.createBlock(block)
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Database error during the creation of new block: ${err}` }); 
    }
  }
);

// Update the status of a ticket, the status is changed from open to closed and vice versa
app.put('/api/tickets/:id/status', isLoggedIn,
  async (req, res) => {

    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(500).json( errors.errors ); // error message is sent back as a json with the error info
    }

    const ticket = await ticketDao.getTicket(req.params.id);
    if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(500).json(ticket);
    //console.log(ticket);
    const newStatus = req.body.status;
    const user = await userDao.getUserById(req.user.id);
    if (user.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
      return res.status(500).json(user);

    if (newStatus !== 'open' && newStatus !== 'closed') {
      return res.status(422).json({ error: 'Invalid status' });
    }

    if(newStatus === 'open' && user.admin !== 1) {
      return res.status(401).json({ error: 'Unauthorized' }); //only admin can re-open a ticket
    }

    try {
      const result = await ticketDao.updateTicketStatus(ticket, newStatus);
      if (result.error)
        res.status(500).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Database error during the update of ticket: ${err}` }); 
    }
  }
);

// Update the category of a ticket
app.put('/api/tickets/:id/category', isLoggedIn,
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(500).json( errors.errors ); // error message is sent back as a json with the error info
    }
    const ticket = await ticketDao.getTicket(req.params.id);
    if (ticket.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(500).json(ticket);

    const user = await userDao.getUserById(req.user.id);
    if (user.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
      return res.status(500).json(user);

    //only admin changes category
    if (user.admin !== 1) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    //the DBMS will check the existence of a category as the constraint specifies
    try {
      const newCategory = req.body.category;
      const category = await ticketDao.getCategory(newCategory);
      if (category.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
              return res.status(422).json(category);

      const result = await ticketDao.updateTicketCategory(ticket, newCategory);
      if (result.error)
        res.status(500).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).json({ error: `Database error during the update of ticket: ${err}` }); 
    }
  }
);

/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  console.log(req.user)
  let authLevel = req.user.admin;
  let userid = req.user.id;

  const payloadToSign = { access: authLevel, userid: userid};
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});

  res.json({token: jwtToken});
});

// activate the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
