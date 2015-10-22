var mongoose = require('mongoose');
var levelSchema = new mongoose.Schema({
  activity: String,
  level: Number,
  occurrence: { type: Date, default: Date.now },
  category: String
});

mongoose.model('Level', levelSchema);
