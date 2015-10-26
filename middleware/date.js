var moment = require('moment');
module.exports = {
    currentDateTime: function () {
      return moment().format().slice(0, 19);
    }
};
