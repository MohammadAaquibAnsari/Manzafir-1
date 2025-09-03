const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['family', 'genZ'], required: true },
  destinations: [String],
  accommodations: [{
    name: String,
    type: String,
    familyFriendly: Boolean,
  }],
  activities: [{
    name: String,
    description: String,
    familyFriendly: Boolean,
  }],
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
