var express = require('express');
var debug = require('debug')('energy');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var dateHelper = require('../middleware/date.js');

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
  mongoose.model('Level').find({}, function (err, levels) {
    if (err) {
      return debug(err);
    } else {
      //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
      res.format({
        html: function () {
          res.render('levels/index', {
            title: 'Levels',
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
  var occurrence = req.body.occurrence;
  var category = req.body.category;
  var notes = req.body.notes;
  //call the create function for our database
  mongoose.model('Level').create({
    activity: activity,
    level: levelRating,
    occurrence: occurrence,
    notes: notes,
    category: category
  }, function (err, level) {
    if (err) {
      res.send('There was a problem adding the information to the database.');
    } else {
      //level has been created
      debug('POST creating new level: ' + level);
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
  res.render('levels/new', {
    title: 'Add New level',
    'current': dateHelper.currentDateTime()
  });
});

router.param('id', function (req, res, next, id) {
  //debug('validating ' + id + ' exists');
  //find the ID in the Database
  mongoose.model('Level').findById(id, function (err, level) {
    //if it isn't found, we are going to repond with 404
    if (err) {
      debug(id + ' was not found');
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
      //debug(level);
      // once validation is done save the new item in the req
      req.id = id;
      // go to the next thing
      next(); 
    } 
  });
});

router.route('/:id')
.get(function (req, res) {
  mongoose.model('Level').findById(req.id, function (err, level) {
    if (err) {
      debug('GET Error: There was a problem retrieving: ' + err);
    } else {
      debug('GET Retrieving ID: ' + level._id);
      debug(level)
      res.format({
        html: function () {
          res.render('levels/show', {
            'level': level
          });
        },
        json: function () {
          res.json(level);
        }
      });
    }
  });
});

router.get('/:id/edit', function (req, res) {
  //search for the level within Mongo
  mongoose.model('Level').findById(req.id, function (err, level) {
    if (err) {
      debug('GET Error: There was a problem retrieving: ' + err);
    } else {
      //Return the level
      debug('GET Retrieving ID: ' + level._id);
      //format the date properly for the value to show correctly in our edit form
      var levelDate = dateHelper.currentDateTime(level.occurrence);
      res.format({
        //HTML response will render the 'edit.jade' template
        html: function () {
          res.render('levels/edit', {
            title: 'Level' + level._id,
            'levelDate': levelDate,
            'level': level
          });
        },
        //JSON response will return the JSON output
        json: function () {
          res.json(level);
        }
      });
    }
  });
});

//PUT to update a level by ID
router.put('/:id/edit', function (req, res) {
  // Get our REST or form values. These rely on the 'name' attributes
  var activity = req.body.activity;
  var levelRating = req.body.level;
  var occurrence = req.body.occurrence;
  var category = req.body.category;
  var notes = req.body.notes;

  //find the document by ID
  mongoose.model('Level').findById(req.id, function (err, level) {
    //update it
    level.update({
      activity: activity,
      levelRating: levelRating,
      occurrence: occurrence,
      category: category,
      notes: notes
    }, function (err, levelID) {
      if (err) {
        res.send('There was a problem updating the information to the database: ' + err);
      } else {
        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
        res.format({
          html: function () {
            res.redirect('/levels/' + level._id);
          },
          //JSON responds showing the updated values
          json: function () {
            res.json(level);
          }
        });
      }
    });
  });
});

//DELETE a Level by ID
router.delete('/:id/edit', function (req, res) {
  //find level by ID
  mongoose.model('Level').findById(req.id, function (err, level) {
    if (err) {
      return debug(err);
    } else {
      //remove it from Mongo
      level.remove(function (err, level) {
        if (err) {
          return debug(err);
        } else {
          //Returning success messages saying it was deleted
          debug('DELETE removing ID: ' + level._id);
          res.format({
            //HTML returns us back to the main page, or you can create a success page
            html: function () {
              res.redirect('/levels');
            },
            //JSON returns the item with the message that is has been deleted
            json: function () {
              res.json({message: 'deleted',
                item: level
              });
            }
          });
        }
      });
    }
  });
});

module.exports = router;
