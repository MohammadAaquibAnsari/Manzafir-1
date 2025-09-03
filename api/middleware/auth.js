const admin = require('firebase-admin');
const User = require('../models/User'); 

const serviceAccount = require('../manzafir-travel-firebase-adminsdk-fbsvc-b1c54e77fe.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
  
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    

    // Find the user in your MongoDB database using the Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(401).json({ message: "User profile not found in database. Please ensure you've made a POST to /api/users/profile first." });
    }


    req.user = user;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err); 
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: "Firebase token expired. Please re-authenticate." });
    }
    return res.status(401).json({ message: "Invalid Firebase token", error: err.message });
  }
};

module.exports = auth;