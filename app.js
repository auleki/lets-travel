require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
var indexRouter = require('./routes/index');

// PassportJS

const User = require('./models/user');
const passport = require('passport');

// FOR SESSIONS

const session = require('express-session');
// the parenthesis at the end runs the function
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');


// mongoose.connect(monngodb_url, {useNewUrlParser: true,useUnifiedTopology: true}).then(()=>{
//   console.log("mongodb is connected");
// }).catch((error)=>{
//   console.log("mondb not connected");
//   console.log(error);
// });
// connecting the database

const url = process.env.DB

const options = {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
}
mongoose.connect(url, options)
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error',console.error.bind(console, 'connection no fit happen:'));
db.once('on', () => {
  console.log('We are connected');
})
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session({
  secret: process.env.SECRET,
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Messages 
app.use(flash());



app.use((req, res, next) => {
  // console.log(`current path is ${req.path}`);
  res.locals.user = req.user;
  res.locals.url = req.path;
  res.locals.flash = req.flash();
  next();
})

// app.use(session({
//   secret: process.env.SECRET,

// }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);



// app.use('/admin', adminRouter);
// connection string


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
