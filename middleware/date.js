"use strict";
let moment = require('moment');
module.exports = {
    currentDateTime: function (date) {
      return moment(date).format().slice(0, 19);
    }
};
