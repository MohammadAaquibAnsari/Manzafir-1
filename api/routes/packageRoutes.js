const express = require('express');
const router = express.Router();
const { getPackages, createPackage } = require('../controllers/packageController');
const packageController = require('../controllers/packageController');
    
router.get('/', getPackages);          
router.post('/create', createPackage); 
router.get('/:packageId', packageController.getPackageById);

module.exports = router;
