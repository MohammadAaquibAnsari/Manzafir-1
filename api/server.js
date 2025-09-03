require("dotenv").config();

const express = require('express');
const auth = require('./middleware/auth');
const connectDB = require('./config/db');
const cors = require("cors");
const nodemailer = require("nodemailer");
const path =require('path'); 

connectDB();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

app.get('/api//protected', auth, (req, res) => {
  res.json({
    message: 'You are authorized!',
    user: req.user,
  });
});

// Mount the new Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Mount your existing API Routes
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/tours', require('./routes/tourRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Existing Contact Route (Keep this as it's a specific top-level route)
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from:`"Manzafir" ${process.env.EMAIL_USER}`,
    to: process.env.EMAIL_USER, // Send email to yourself
    subject: "New Contact Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email.", error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
