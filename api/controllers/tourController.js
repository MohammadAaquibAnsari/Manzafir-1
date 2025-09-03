// server/controllers/tourController.js
const OpenTour = require('../models/OpenTour');
const User = require('../models/User'); // Assuming User model is needed for some ops
// REMOVE: const path = require('path');
// REMOVE: const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig'); // Import Cloudinary

// Helper function to extract Cloudinary public_id from URL
const getCloudinaryPublicId = (url, folder) => {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    const regex = new RegExp(`${folder}\\/([^./]+)\.[a-zA-Z0-9]+$`);
    const match = url.match(regex);
    return match ? `${folder}/${match[1]}` : null;
};

// Helper function to delete images from Cloudinary
const deleteCloudinaryImages = async (imageUrls, folder) => {
    if (!imageUrls || imageUrls.length === 0) return;

    for (const url of imageUrls) {
        const publicId = getCloudinaryPublicId(url, folder);
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
                console.log(`Deleted old Cloudinary image: ${publicId}`);
            } catch (deleteError) {
                console.warn(`Failed to delete old Cloudinary image ${publicId}:`, deleteError.message);
            }
        }
    }
};


// Get all open tours
exports.getTours = async (req, res) => {
    try {
        const tours = await OpenTour.find()
            .populate('packageId creatorId')
            .populate('participants', 'name');
        res.json(tours);
    } catch (err) {
        console.error('Error fetching tours:', err);
        res.status(500).send('Server error');
    }
};

// Create a new open tour
exports.createTour = async (req, res) => {
    try {
        let { packageId, creatorId, travelDates, price, name, description } = req.body;
        travelDates = JSON.parse(travelDates); // Parse travelDates from JSON string

        if (!packageId || !creatorId || !travelDates.start || !travelDates.end || !price) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const images = req.files; // Files from multer (now buffers in memory)
        let imageUrls = [];

        if (images && images.length > 0) {
            for (const file of images) {
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
                try {
                    const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
                        folder: 'manzafir_tour_images', // Dedicated folder for tour images in Cloudinary
                        use_filename: true,
                        unique_filename: true, // Appends a unique suffix to the filename
                        overwrite: false,
                    });
                    imageUrls.push(cloudinaryResponse.secure_url);
                } catch (cloudinaryError) {
                    console.error('Cloudinary upload error for tour image:', cloudinaryError);
                    return res.status(500).json({ message: 'Failed to upload tour images to Cloudinary' });
                }
            }
        }

        const newTour = new OpenTour({
            name,
            description,
            packageId,
            creatorId,
            travelDates,
            price,
            images: imageUrls // Store Cloudinary URLs
        });

        await newTour.save();
        res.status(201).json(newTour);
    } catch (err) {
        console.error('Error creating tour:', err);
        res.status(500).send('Server error');
    }
};

// Join an open tour
exports.joinTour = async (req, res) => {
    const tourId = req.params.id;
    const userId = req.user._id; // User ID from auth middleware

    try {
        const tour = await OpenTour.findById(tourId);
        if (!tour) return res.status(404).json({ message: 'Tour not found' });

        if (tour.participants.includes(userId)) {
            return res.status(400).json({ message: 'You have already joined this tour' });
        }

        tour.participants.push(userId);
        await tour.save();
        res.json({ message: 'Successfully joined the tour', tour });
    } catch (err) {
        console.error('Error joining tour:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- NEW: Leave an open tour ---
exports.leaveTour = async (req, res) => {
    const tourId = req.params.id;
    const userId = req.user._id; // User ID from auth middleware

    try {
        const tour = await OpenTour.findById(tourId);
        if (!tour) return res.status(404).json({ message: 'Tour not found' });

        // Remove user from participants array
        const initialParticipantsLength = tour.participants.length;
        tour.participants = tour.participants.filter(
            (participantId) => participantId.toString() !== userId.toString()
        );

        if (tour.participants.length === initialParticipantsLength) {
            return res.status(400).json({ message: 'You are not a participant in this tour.' });
        }

        await tour.save();
        res.json({ message: 'Successfully left the tour', tour });
    } catch (err) {
        console.error('Error leaving tour:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// --- END NEW ---

// Update an existing open tour
exports.updateTour = async (req, res) => {
    const tourId = req.params.id;
    const currentUserId = req.user.id;

    try {
        const tour = await OpenTour.findById(tourId);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        if (tour.creatorId.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this tour.' });
        }

        let { packageId, travelDates, price, name, description, existingImageUrls } = req.body; // Expect existingImageUrls as JSON string

        if (travelDates && typeof travelDates === 'string') {
            travelDates = JSON.parse(travelDates);
        }
        
        // Handle existing images passed from frontend (these are the ones to keep)
        let currentImageUrls = [];
        if (existingImageUrls && typeof existingImageUrls === 'string') {
            currentImageUrls = JSON.parse(existingImageUrls);
        } else if (Array.isArray(existingImageUrls)) {
            currentImageUrls = existingImageUrls; // If already an array (e.g., from direct object passing)
        }

        // Identify images to delete (those in DB but not in currentImageUrls)
        const imagesToDelete = tour.images.filter(url => !currentImageUrls.includes(url));
        if (imagesToDelete.length > 0) {
            await deleteCloudinaryImages(imagesToDelete, 'manzafir_tour_images');
        }

        // Process new images uploaded
        const newImages = req.files; // Files from multer (buffers)
        let newlyUploadedImageUrls = [];
        if (newImages && newImages.length > 0) {
            for (const file of newImages) {
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = 'data:' + file.mimetype + ';base64,' + b64;
                try {
                    const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
                        folder: 'manzafir_tour_images',
                        use_filename: true,
                        unique_filename: true,
                        overwrite: false,
                    });
                    newlyUploadedImageUrls.push(cloudinaryResponse.secure_url);
                } catch (cloudinaryError) {
                    console.error('Cloudinary upload error for new tour image:', cloudinaryError);
                    return res.status(500).json({ message: 'Failed to upload new tour images to Cloudinary' });
                }
            }
        }
        
        // Combine retained old images with newly uploaded ones
        let finalImageUrls = [...currentImageUrls, ...newlyUploadedImageUrls];

        if (req.body.clearImages === 'true') {
            // Delete all current images from Cloudinary before clearing
            await deleteCloudinaryImages(tour.images, 'manzafir_tour_images');
            finalImageUrls = [];
        }


        if (name !== undefined) tour.name = name;
        if (description !== undefined) tour.description = description;
        if (packageId !== undefined) tour.packageId = packageId;
        if (travelDates !== undefined) tour.travelDates = travelDates;
        if (price !== undefined) tour.price = price;
        tour.images = finalImageUrls; // Update with the final list of Cloudinary URLs

        await tour.save();

        const updatedTour = await OpenTour.findById(tour._id)
                                        .populate('packageId creatorId')
                                        .populate('participants', 'name');

        res.status(200).json({ message: 'Tour updated successfully', tour: updatedTour });

    } catch (err) {
        console.error('Error updating tour:', err);
        res.status(500).json({ message: 'Server error during tour update.' });
    }
};

// Get a single tour by ID
exports.getTourById = async (req, res) => {
    try {
        const tour = await OpenTour.findById(req.params.id)
            .populate('packageId creatorId')
            .populate('participants', 'name');

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }
        res.json(tour);
    } catch (err) {
        console.error('Error fetching tour by ID:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid tour ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching tour.' });
    }
};
