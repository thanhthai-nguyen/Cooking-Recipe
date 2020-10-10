require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require("passport");
const path = require("path");

//=== 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// view engine setup
app.set('views', path.join(__dirname, 'views')); // Thư mục views nằm cùng cấp với file server.js
app.set('view engine', 'jade'); // Sử dụng jade làm view engine

//=== 3 - INITIALIZE PASSPORT MIDDLEWARE
app.use(passport.initialize());
require("./middlewares/jwt")(passport);
require("./middlewares/passport")(passport);

//=== 4 - CONFIGURE ROUTES
//Configure Route
require("./routes/index")(app);

module.exports = app;