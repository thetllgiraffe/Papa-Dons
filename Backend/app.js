const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const port = process.env.PORT || 8080;


global.appRoot = __dirname;

app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, '../Frontend')));

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const panelRouter = require('./routes/panel');

app.use(express.urlencoded({ extended: true })); // For form submissions
app.use(express.json()); // To parse JSON bodies

// Routes
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/panel', panelRouter);

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

