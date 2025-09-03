const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String,},
  bio: String,
  profilePicture: String,
  preferences: {
    travelType: { type: String, enum: ['family', 'genZ'], default: 'family' }
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
  favoriteTours: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OpenTour' }],
  pastTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
  createdTours: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OpenTour' }],
  joinedTours: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OpenTour' }],
  swipedUsers: { type: Array, default: [] }, 
  matchedUsers: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Password hash middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') && this.password) return next(); 
  if (this.isModified('password') && this.password) { 
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
