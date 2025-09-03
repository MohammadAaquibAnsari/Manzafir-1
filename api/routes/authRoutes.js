const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to send a verification code to the user's email during signup
router.post('/send-verification-code', authController.sendVerificationCode);

// Route to verify the code and complete user registration (Firebase + MongoDB)
router.post('/verify-code-and-register', authController.verifyCodeAndRegister);

module.exports = router;
