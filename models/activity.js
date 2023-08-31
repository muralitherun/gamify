const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, required: true }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;