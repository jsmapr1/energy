var mongoose = require('mongoose');
var levelSchema = new mongoose.Schema({
  activity: String,
  level: Number,
  occurence: { type: Date, default: Date.now },
  category: String
});

mongoose.model('level', levelSchema);
