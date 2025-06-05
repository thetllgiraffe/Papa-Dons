const express = require('express');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 8080;
const path = require('path');


require('dotenv').config();

global.appRoot = __dirname;

app.use(session({
  secret: 'your-very-secure-secret', // Change this to a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // Use `true` if using HTTPS
  // cookie: { maxAge: 30 * 60 * 1000 } // 30 mins
}));


app.use('/', express.static(path.join(__dirname, '../Frontend')));

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');


app.use(express.urlencoded({ extended: true })); // For form submissions
app.use(express.json()); // To parse JSON bodies


// Routes
app.use('/', indexRouter);
app.use('/admin', adminRouter);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

