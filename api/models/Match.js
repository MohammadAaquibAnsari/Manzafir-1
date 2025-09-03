const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'matched'], default: 'pending' },
});

module.exports = mongoose.model('Match', MatchSchema);