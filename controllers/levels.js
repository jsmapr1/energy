"use strict";
const express = require('express');
const debug = require('debug')('energy');
const router = express.Router();
const mongoose = require('mongoose');
const Level = mongoose.model('Level');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const dateHelper = require('../middleware/date.js');
const gcm = require('node-gcm');
const config = require('../local/config');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride((req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

router.route('/')
.get((req, res) => {
  Level.find({}, (err, levels) => {
    if (err) 
      return debug(err);
    //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
    res.format({
      html: () => {
        res.render('levels/index', {
          title: 'Levels',
          'levels': levels
        });
      },
      json: () => {
        res.json(levels);
      }
    });
  });
})

//POST a new level
.post((req, res) => {
  let level = new Level({
    activity: req.body.activity,
    level: req.body.level,
    occurrence: req.body.occurrence,
    notes: req.body.notes,
    category: req.body.category
  });

  level.save()
  .then(() => {
    debug('POST creating new level: ' + level);
    res.format({
      html: () => {
        res.redirect('/levels');
      },
      json: () => {
        res.json(level);
      }
    });
  })
  .catch((err) => {
    res.send('There was a problem adding the information to the database.');
  });
});

router.get('/new', (req, res) => {
  res.render('levels/new', {
    title: 'Add New level',
    'current': dateHelper.currentDateTime()
  });
});

router.post('/message', (req,res) => {
  const message = new gcm.Message();
  const sender = new gcm.Sender(config.gcmAPI);

  sender.sendNoRetry(message, { registrationTokens: [req.body.registrationToken] }, (err, response) => {
    if(err){
      res.status(500).send('Something broke!');
      return err;
    }
    else{
      res.send(JSON.stringify(response));
      return response;
    };
  });
});

router.param('id', (req, res, next, id) => {
  //debug('validating ' + id + ' exists');
  //find the ID in the Database
  Level.findById(id, (err, level) => {
    //if it isn't found, we are going to repond with 404
    if (err) {
      debug(id + ' was not found');
      res.status(404);
      err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: () => {
          next(err);
        },
        json: () => {
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
.get((req, res) => {
  Level.findById(req.id, (err, level) => {
    if (err) {
      debug('GET Error: There was a problem retrieving: ' + err);
    } else {
      debug('GET Retrieving ID: ' + level._id);
      debug(level)
      res.format({
        html: () => {
          res.render('levels/show', {
            'level': level
          });
        },
        json: () => {
          res.json(level);
        }
      });
    }
  });
});

router.get('/:id/edit', (req, res) => {
  //search for the level within Mongo
  Level.findById(req.id, (err, level) => {
    if (err) {
      debug('GET Error: There was a problem retrieving: ' + err);
    } else {
      //Return the level
      debug('GET Retrieving ID: ' + level._id);
      //format the date properly for the value to show correctly in our edit form
      const levelDate = dateHelper.currentDateTime(level.occurrence);
      res.format({
        //HTML response will render the 'edit.jade' template
        html: () => {
          res.render('levels/edit', {
            title: 'Level' + level._id,
            'levelDate': levelDate,
            'level': level
          });
        },
        //JSON response will return the JSON output
        json: () => {
          res.json(level);
        }
      });
    }
  });
});

//PUT to update a level by ID
router.put('/:id/edit', (req, res) => {
  // Get our REST or form values. These rely on the 'name' attributes
  const activity = req.body.activity;
  const levelRating = req.body.level;
  const occurrence = req.body.occurrence;
  const category = req.body.category;
  const notes = req.body.notes;

  //find the document by ID
  Level.findById(req.id, (err, level) => {
    //update it
    level.update({
      activity: activity,
      levelRating: levelRating,
      occurrence: occurrence,
      category: category,
      notes: notes
    }, (err, levelID) => {
      if (err) {
        res.send('There was a problem updating the information to the database: ' + err);
      } else {
        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
        res.format({
          html: () => {
            res.redirect('/levels/' + level._id);
          },
          //JSON responds showing the updated values
          json: () => {
            res.json(level);
          }
        });
      }
    });
  });
});

//DELETE a Level by ID
router.delete('/:id/edit', (req, res) => {
  //find level by ID
  Level.findById(req.id, (err, level) => {
    if (err) {
      return debug(err);
    } else {
      //remove it from Mongo
      level.remove((err, level) => {
        if (err) {
          return debug(err);
        } else {
          //Returning success messages saying it was deleted
          debug('DELETE removing ID: ' + level._id);
          res.format({
            //HTML returns us back to the main page, or you can create a success page
            html: () => {
              res.redirect('/levels');
            },
            //JSON returns the item with the message that is has been deleted
            json: () => {
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
