// server/controllers/userController.js
const User = require('../models/User');
const admin = require('firebase-admin'); // KEEP THIS: Needed for Firebase Auth
const cloudinary = require('../config/cloudinaryConfig'); // ADD THIS: Import Cloudinary

// Helper function to extract Cloudinary public_id from URL
const getCloudinaryPublicId = (url, folder) => {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    // Regex to match folder/public_id.extension
    const regex = new RegExp(`${folder}\\/([^./]+)\.[a-zA-Z0-9]+$`);
    const match = url.match(regex);
    return match ? `${folder}/${match[1]}` : null;
};

// Helper function to delete image from Cloudinary (for single image deletion)
const deleteCloudinaryImage = async (imageUrl, folder) => {
    const publicId = getCloudinaryPublicId(imageUrl, folder);
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted old Cloudinary image: ${publicId}`);
        } catch (deleteError) {
            console.warn(`Failed to delete old Cloudinary image ${publicId}:`, deleteError.message);
        }
    }
};

// 1. ADD THIS FUNCTION: registerUser
exports.registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password // Remember to hash this password before saving to DB!
        });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during registration');
    }
};

// 2. ADD THIS FUNCTION: loginUser
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }


        res.json({ message: 'User logged in successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during login');
    }
};

// 3. KEEP YOUR EXISTING firebaseRegisterOrLoginUser FUNCTION
exports.firebaseRegisterOrLoginUser = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const idToken = authHeader.replace('Bearer ', '');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, name, email } = decodedToken;

        let user = await User.findOne({ firebaseUid: uid }); // First, try to find by Firebase UID

        // If user not found by firebaseUid, try to find by email
        if (!user && email) {
            user = await User.findOne({ email });
            if (user) {
                user.firebaseUid = uid;
                await user.save();
                console.log("FirebaseRegisterOrLogin: Existing user found by email, updated firebaseUid:", user._id);
            }
        }

        if (!user) {
            user = new User({
                name: name || "Anonymous User",
                email,
                firebaseUid: uid,
                followers: [],
                following: [],
                favorites: [],
                bio: '',
            });
            await user.save();
        } else {
            // Optionally update user's email/name if they've changed in Firebase
            if (name && user.name !== name) user.name = name;
            if (email && user.email !== email) user.email = email;
            // Only save if changes were made
            if (user.isModified('name') || user.isModified('email')) {
                await user.save();
            }
        }

        return res.status(200).json(user);

    } catch (error) {
        console.error('Firebase Auth error in firebaseRegisterOrLoginUser:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({ message: 'A user with this email already exists. Please log in or use a different email.' });
        }
        return res.status(401).json({ message: 'Invalid or expired Firebase token' });
    }
};

// 4. KEEP YOUR EXISTING getUserProfile FUNCTION
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Server error');
    }
};

// 5. KEEP YOUR EXISTING getUserProfileById FUNCTION
exports.getUserProfileById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).send('Server error');
    }
};

// 6. UPDATE THIS FUNCTION: updateUserProfile
exports.updateUserProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }

    const { name, bio, preferences, profilePicture: profilePictureFromBody } = req.body; 

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update text fields if they are provided
        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;

        // --- PROFILE PICTURE HANDLING WITH CLOUDINARY ---
        if (req.file) { // If a new file was uploaded by multer (buffer in memory)
            const file = req.file;
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
            
            try {
                // Delete old profile picture from Cloudinary first, if it exists
                if (user.profilePicture && user.profilePicture.includes('res.cloudinary.com')) {
                    await deleteCloudinaryImage(user.profilePicture, 'manzafir_profile_pictures');
                }

                const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
                    folder: 'manzafir_profile_pictures', 
                    use_filename: true,
                    unique_filename: true, 
                    overwrite: false, 
                });
                user.profilePicture = cloudinaryResponse.secure_url; // Store the Cloudinary URL
                console.log(`Profile picture uploaded to Cloudinary: ${user.profilePicture}`);

            } catch (cloudinaryError) {
                console.error('Cloudinary upload error for profile picture:', cloudinaryError);
                return res.status(500).json({ message: 'Failed to upload profile picture to Cloudinary' });
            }
        } else if (profilePictureFromBody === 'CLEAR' && user.profilePicture) {
           
     
            if (user.profilePicture.includes('res.cloudinary.com')) {
                await deleteCloudinaryImage(user.profilePicture, 'manzafir_profile_pictures');
            }
            user.profilePicture = ''; // Clear the profile picture URL in DB
            console.log('Profile picture explicitly cleared.');
        } else if (profilePictureFromBody === '' && user.profilePicture && user.profilePicture.includes('uploads/profile_pictures')) {
  
            user.profilePicture = '';
            console.log('Profile picture path cleared from DB (old local storage).');
        }
       


        // Handle nested preferences
        if (preferences && preferences.travelType !== undefined) {
            user.preferences = user.preferences || {};
            user.preferences.travelType = preferences.travelType;
        }
      


        await user.save();

        const updatedUser = await User.findById(user._id)
            .select('-password')
            .populate('followers', 'name profilePicture')
            .populate('following', 'name profilePicture');

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        console.error('Error updating user profile:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error during profile update.' });
    }
};

// 7. KEEP YOUR EXISTING updateFavorites FUNCTION
exports.updateFavorites = async (req, res) => {
    const { packageId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const index = user.favorites.indexOf(packageId);

        if (index >= 0) {
            user.favorites.splice(index, 1); // Remove from favorites
        } else {
            user.favorites.push(packageId); // Add to favorites
        }

        await user.save();
        res.json(user.favorites);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.getMatchedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUser = await User.findById(currentUserId).populate({
            path: 'matchedUsers',
            select: 'name profilePicture bio _id'
        });

        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found.' });
        }

        res.status(200).json(currentUser.matchedUsers);

    } catch (error) {
        console.error('Error in getMatchedUsers:', error);
        res.status(500).json({ message: 'Server error while fetching matched users.' });
    }
};

exports.followUser = async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user._id;

    try {
        const userToFollow = await User.findById(id);
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!userToFollow.followers.includes(currentUserId)) {
            userToFollow.followers.push(currentUserId);
            await userToFollow.save();
        }

        if (!currentUser.following.includes(id)) {
            currentUser.following.push(id);
            await currentUser.save();
        }

        res.status(200).json({ message: 'Followed successfully' });
    } catch (error) {
        console.error('Error in followUser:', error);
        res.status(500).json({ error: 'Something went wrong during follow.' });
    }
};

// <<< ADDED: unfollowUser function
exports.unfollowUser = async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user._id;

    try {
        const userToUnfollow = await User.findById(id);
        const currentUser = await User.findById(currentUserId);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        userToUnfollow.followers = userToUnfollow.followers.filter(
            (followerId) => followerId.toString() !== currentUserId.toString()
        );
        await userToUnfollow.save();

        currentUser.following = currentUser.following.filter(
            (followedId) => followedId.toString() !== id.toString()
        );
        await currentUser.save();

        res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
        console.error('Error in unfollowUser:', error);
        res.status(500).json({ error: 'Something went wrong during unfollow.' });
    }
};

// <<< ADDED: getFollowStatus function
exports.getFollowStatus = async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user._id;

    try {
        const userProfile = await User.findById(id);
        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        const isFollowing = userProfile.followers.includes(currentUserId);
        res.status(200).json({ isFollowing });
    } catch (error) {
        console.error('Error in getFollowStatus:', error);
        res.status(500).json({ error: 'Something went wrong while fetching follow status.' });
    }
};

// <<< ADDED: updateFavoriteTours function
exports.updateFavoriteTours = async (req, res) => {
    const { tourId } = req.body;
    const userId = req.user._id;

    if (!tourId) {
        return res.status(400).json({ message: 'Tour ID is required.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const index = user.favoriteTours.indexOf(tourId);

        if (index >= 0) {
            user.favoriteTours.splice(index, 1);
            await user.save();
            res.status(200).json({ message: 'Tour unfavorited successfully.', isFavorited: false });
        } else {
            user.favoriteTours.push(tourId);
            await user.save();
            res.status(200).json({ message: 'Tour favorited successfully.', isFavorited: true });
        }
    } catch (error) {
        console.error('Error in updateFavoriteTours:', error);
        res.status(500).json({ message: 'Server error while updating favorite tours.' });
    }
};
