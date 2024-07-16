'use strict';

const dayjs = require('dayjs');
const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult, oneOf } = require('express-validator'); // validation middleware
const cors = require('cors');

const { expressjwt: jwt } = require('express-jwt');
const jwtSecret = '9c0D949A6288gta0912joGiiroo6iG4oiF6i6m9Ddwllc0xRqd325wmpfsRr';

// init express
const app = new express();
const port = 3002;

const corsOptions = {
  origin: 'http://127.0.0.1:5173',
  credentials: true,
};
app.use(cors(corsOptions)); //CHANGE the option

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
  // token from HTTP Authorization: header
})
);

// To return a better object in case of errors
app.use( function (err, req, res, next) {
  //console.log("DEBUG: error handling function executed");
  console.log(err);
  if (err.name === 'UnauthorizedError') {
    // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
    res.status(401).json({ errors: [{  'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
});

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/***----------------------------- APIs ------------------------------------***/


app.post('/api/estimate', (req, res) => {
  console.log(req.auth);
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(500).json(errors.errors); // error message is sent back as a json with the error info
  }
  const { title, category } = req.body;
  
  if (title==='' || category==='') {
    return res.status(422).json({ error : 'Title and category must be provided'});
  }

  const characters = (title + category).replace(/\s/g, '').length;
  const randomTime = Math.floor(Math.random() * 240) + 1;
  const estimatedHours = (characters * 10) + randomTime;
  if(req.auth.access === 1){
    const estimation = estimatedHours;
    res.json({ estimation });
  }
  else{
    const estimation = Math.round(estimatedHours / 24);
    //console.log(estimatedDays);
    res.json({ estimation });
  }
});

//DEBUG API
/*
app.post('/api/estimatedays', (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.errors); // error message is sent back as a json with the error info
  }
  const { title, category } = req.body;
  const characters = (title + category).replace(/\s/g, '').length;
  const randomTime = Math.floor(Math.random() * 240) + 1;
  const estimatedHours = (characters * 10) + randomTime;
  
  res.json({ estimatedDays });
});
*/

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
