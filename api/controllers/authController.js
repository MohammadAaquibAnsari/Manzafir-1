const admin = require('firebase-admin'); // Firebase Admin SDK for user creation
const User = require('../models/User'); // Your MongoDB User model
const VerificationCode = require('../models/VerificationCode'); // The new model
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating random codes

// Configure Nodemailer 
const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send verification code to user's email
exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        // Check if a user with this email already exists in Firebase Auth
        try {
            await admin.auth().getUserByEmail(email);
            return res.status(409).json({ message: 'User with this email already exists.' });
        } catch (error) {
            // If user not found (error.code === 'auth/user-not-found'), proceed.
            if (error.code !== 'auth/user-not-found') {
                console.error('Firebase Auth check error:', error);
                return res.status(500).json({ message: 'Server error during user check.' });
            }
        }

        // Generate a 6-digit numeric code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Code valid for 10 minutes

        // Save or update the verification code in MongoDB
        await VerificationCode.findOneAndUpdate(
            { email },
            { code, expiresAt, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true } 
        );

        // Send email
        const mailOptions = {
            from: `"Manzafir" ${process.env.EMAIL_USER}`,
            to: email,
            subject: "Manzafir Email Verification Code",
            text: `Your verification code for Manzafir is: ${code}\nThis code is valid for 10 minutes.`,
            html: `<p>Your verification code for Manzafir is: <strong>${code}</strong></p><p>This code is valid for 10 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Verification code sent to your email.' });

    } catch (error) {
        console.error('Error sending verification code:', error);
        res.status(500).json({ message: 'Failed to send verification code.', error: error.message });
    }
};

// Function to verify code and register user
exports.verifyCodeAndRegister = async (req, res) => {
    const { email, password, code, name } = req.body;

    if (!email || !password || !code || !name) {
        return res.status(400).json({ message: 'Email, password, name, and code are required.' });
    }

    try {
        // 1. Find and validate the verification code
        const storedCode = await VerificationCode.findOne({ email, code });

        if (!storedCode) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        if (new Date() > storedCode.expiresAt) {
            await VerificationCode.deleteOne({ _id: storedCode._id }); // Clean up expired code
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        // 2. Create user in Firebase Authentication
        const firebaseUserRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
            emailVerified: true, 
        });
        const firebaseUid = firebaseUserRecord.uid;

        // 3. Save user details to MongoDB
        const newUser = new User({
            name,
            email,
            firebaseUid,
            bio: '', 
            profilePicture: '', 
            followers: [],
            following: [],
            favorites: [],
            favoriteTours: [], 
            preferences: { travelType: 'family' } 
        });
        await newUser.save();

        // 4. Delete the used verification code
        await VerificationCode.deleteOne({ _id: storedCode._id });

        // 5. Generate a custom token for the frontend to sign in
        const customToken = await admin.auth().createCustomToken(firebaseUid);
        console.log("Backend Generated Custom Token (authController):", customToken);

        res.status(201).json({
            message: 'User registered successfully!',
            user: newUser, 
            customToken, 
        });

    } catch (error) {
        console.error('Error verifying code and registering user:', error);

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
            return res.status(409).json({ message: 'This email is already registered.' });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ message: 'Invalid email address format.' });
        }
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ message: 'Password is too weak.' });
        }
        // Handle MongoDB duplicate key errors if email or firebaseUid is unique
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A user with this email or ID already exists.' });
        }

        res.status(500).json({ message: 'Failed to complete registration.', error: error.message });
    }
};


