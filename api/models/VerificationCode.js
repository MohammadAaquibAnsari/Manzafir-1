const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, 
        lowercase: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '0s' }, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


module.exports = mongoose.model('VerificationCode', VerificationCodeSchema);
