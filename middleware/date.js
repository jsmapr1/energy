module.exports = {
    currentDateTime: function () {
      return new Date(new Date().getTime() - 300 * 60 * 1000).toISOString().slice(0, 19);
    }
};
