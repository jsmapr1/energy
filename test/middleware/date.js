'use strict';
let assert = require('assert');
let dateHelper = require('../../middleware/date.js');
let moment = require('moment');

describe('Middleware Date Tests', () => {
  it('returns current date in ISO', () => {
    let currentDate = dateHelper.currentDateTime();
    assert(currentDate.match(/([0-9]|-){10}T([0-9|:]){8}/));
  });

  it('returns the current time for this timezone', () => {
    let d = new Date;
    let current = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    let currentDate = dateHelper.currentDateTime();
    let momentFormatted = moment(currentDate).format('M/D/YYYY h:mm:ss A');
    assert(current == momentFormatted);
  })
});
