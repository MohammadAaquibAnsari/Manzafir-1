const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const { tourImageUpload } = require('../middleware/multerConfig'); 

const {
  getTours,
  createTour,
  joinTour,
  leaveTour, 
  updateTour,
  getTourById
} = require('../controllers/tourController');

// Get all tours (protected)
router.get('/', auth, getTours);

// Create a new tour (protected, handles image upload)
router.post('/', auth, tourImageUpload.array('images', 5), createTour); 

// Join a tour (protected)
router.post('/:id/join', auth, joinTour);

// --- Leave a tour ---
router.post('/:id/leave', auth, leaveTour);


// Update a tour 
router.put('/:id', auth, tourImageUpload.array('images', 5), updateTour);

// Get a single tour by ID
router.get('/:id', auth, getTourById);

module.exports = router;
