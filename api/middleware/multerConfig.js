const multer = require('multer');
const storage = multer.memoryStorage();

// File filter to allow only image files (can be reused)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// --- Multer instance for Profile Pictures ---
const profilePictureUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// --- Multer instance for Tour Images ---
const tourImageUpload = multer({
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

module.exports = {
    profilePictureUpload,
    tourImageUpload,
};
