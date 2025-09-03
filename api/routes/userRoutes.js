const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User'); 
const Match = require('../models/Match'); 
const { profilePictureUpload } = require('../middleware/multerConfig'); 

const {
    registerUser,
    loginUser,
    firebaseRegisterOrLoginUser, 
    updateUserProfile,
    updateFavorites,
    getUserProfileById,
    getUserProfile,
    getMatchedUsers,
    followUser,
    unfollowUser,
    getFollowStatus,
    updateFavoriteTours
} = require('../controllers/userController');


router.post('/register', registerUser);
router.post('/login', loginUser);


router.post('/profile', firebaseRegisterOrLoginUser); 

// ---------- Protected Routes (Require user to be in MongoDB, validated by auth middleware) ----------
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, profilePictureUpload.single('profilePicture'), updateUserProfile);
router.put('/favorites', auth, updateFavorites);
router.get('/users/:userId', auth, getUserProfileById);

// GET users for swiping
router.get('/', auth, async (req, res) => {
    try {
        const { userId } = req.query; // Consider using req.user._id if always authenticated
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Current user not found for swiping.' });
        const swipedUserIds = user.swipedUsers;
        const usersToSwipe = await User.find({ _id: { $nin: [...swipedUserIds, userId] } }).select('-password');
        res.json(usersToSwipe);
    } catch (error) {
        console.error('Error fetching users for swipe deck:', error);
        res.status(500).json({ message: 'Server error fetching users for swipe deck.' });
    }
});

// POST for swiping
router.post('/swipe', auth, async (req, res) => {
    const { userId, swipedUserId, action } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).send('Swiping user not found');
        user.swipedUsers.push(swipedUserId);
        await user.save();
        if (action === 'right') {
            const swipedUser = await User.findById(swipedUserId);
            if (!swipedUser) return res.status(404).send('Swiped user not found');
            if (swipedUser.swipedUsers.includes(userId)) {
                user.matchedUsers.push(swipedUserId);
                swipedUser.matchedUsers.push(userId);
                await user.save();
                await swipedUser.save();
                await Match.create({ userId, matchedUserId: swipedUserId, status: 'matched' });
                return res.json({ message: 'It\'s a match!' });
            }
        }
        res.json({ message: 'Swipe recorded' });
    } catch (error) {
        console.error('Error during swipe action:', error);
        res.status(500).json({ message: 'Server error during swipe.' });
    }
});

router.get('/matches', auth, getMatchedUsers);
router.post('/:id/follow', auth, followUser);
router.post('/:id/unfollow', auth, unfollowUser);
router.get('/:id/follow-status', auth, getFollowStatus);
router.post('/favorite-tours', auth, updateFavoriteTours);

module.exports = router;
