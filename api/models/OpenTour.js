const mongoose = require('mongoose');

const openTourSchema = new mongoose.Schema({
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:{type:String},
  description: {type:String},
  travelDates: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  price: {type:Number},
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  images:[{type:String}]
}, { timestamps: true });

module.exports = mongoose.model('OpenTour', openTourSchema);
