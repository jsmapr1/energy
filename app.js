const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const db = require('./model/db');
const level = require('./model/levels');
const routes = require('./routes/index');
const levels = require('./controllers/levels');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

//routes
app.use('/', routes);
app.use('/levels', levels);
app.use('/sw.js',express.static(__dirname+'/sw.js'))
app.use('/manifest.json',express.static(__dirname+'/manifest.json'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.locals.moment = require('moment');
module.exports = app;
