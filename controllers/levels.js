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
  Level.findById(id).exec()
  .then((level) => {
      req.id = id;
      next(); 
  })
  .catch((err) => {
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
  });
});

router.route('/:id')
.get((req, res) => {
  Level.findById(req.id).exec()
  .then((level) => {
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
  })
  .catch((err) => {
    debug('GET Error: There was a problem retrieving: ' + err);
  })
});

router.get('/:id/edit', (req, res) => {
  Level.findById(req.id).exec()
  .then((level) => {
    debug('GET Retrieving ID: ' + level._id);

    const levelDate = dateHelper.currentDateTime(level.occurrence);
    res.format({
      html: () => {
        res.render('levels/edit', {
          title: 'Level' + level._id,
          'levelDate': levelDate,
          'level': level
        });
      },
      json: () => {
        res.json(level);
      }
    })
  })
  .catch((err) => {
      debug('GET Error: There was a problem retrieving: ' + err);
  })
});

//PUT to update a level by ID
router.put('/:id/edit', (req, res) => {
  Level.findById(req.id).exec()
  .then((level) => {
    debug(level);
    Object.assign(level, {
      activity: req.body.activity,
      level: req.body.level,
      occurrence: req.body.occurrence,
      category: req.body.category,
      notes: req.body.notes
    })
    return level.save();
  })
  .then((level) => {
    res.format({
      html: () => {
        res.redirect('/levels/' + level._id);
      },
      json: () => {
        res.json(level);
      }
    });
  })
  .catch((err) => {
    res.send('There was a problem updating the information to the database: ' + err);
  });
});

//DELETE a Level by ID
router.delete('/:id/edit', (req, res) => {

  Level.findById(req.id, (err, level) => {
    if (err) {
      return debug(err);
    } else {

      level.remove((err, level) => {
        if (err) {
          return debug(err);
        } else {

          debug('DELETE removing ID: ' + level._id);
          res.format({
            html: () => {
              res.redirect('/levels');
            },
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
