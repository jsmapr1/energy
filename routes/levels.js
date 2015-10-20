var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function (req) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));


router.route('/')
.get(function (req, res) {
  mongoose.model('EnergyLevel').find({}, function (err, levels) {
    if (err) {
      return console.error(err);
    } else {
      //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
      res.format({
        html: function () {
          res.render('levels/index', {
            title: 'EnergyLevels',
            'levels': levels
          });
        },
        json: function () {
          res.json(levels);
        }
      });
    }
  });
})
//POST a new level
.post(function (req, res) {
  var activity = req.body.activity;
  var levelRating = req.body.level;
  var occurence = req.body.occurence;
  var category = req.body.category;
  //call the create function for our database
  mongoose.model('EnergyLevel').create({
    activity: activity,
    level: levelRating,
    occurence: occurence,
    category: category
  }, function (err, level) {
    if (err) {
      res.send('There was a problem adding the information to the database.');
    } else {
      //level has been created
      console.log('POST creating new level: ' + level);
      res.format({
        html: function () {
          // If it worked, set the header so the address bar doesn't still say /adduser
          res.location('levels');
          // And forward to success page
          res.redirect('/levels');
        },
        //JSON response will show the newly created level
        json: function () {
          res.json(level);
        }
      });
    }
  });
});

router.get('/new', function (req, res) {
  res.render('levels/new', { title: 'Add New level' });
});

router.param('id', function (req, res, next, id) {
  //console.log('validating ' + id + ' exists');
  //find the ID in the Database
  mongoose.model('Level').findById(id, function (err, level) {
    //if it isn't found, we are going to repond with 404
    if (err) {
      console.log(id + ' was not found');
      res.status(404);
      err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: function () {
          next(err);
        },
        json: function () {
          res.json({message: err.status + ' ' + err});
        }
      });
      //if it is found we continue on
    } else {
      //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
      //console.log(level);
      // once validation is done save the new item in the req
      req.id = id;
      // go to the next thing
      next(); 
    } 
  });
});
