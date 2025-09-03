import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // This is your MongoDB user object
  const [firebaseUser, setFirebaseUser] = useState(null); // Firebase user object
  const [loading, setLoading] = useState(true);

  // Helper function to fetch/register user on backend and update context
  const syncUserWithBackend = async (userFromFirebase) => {
    if (!userFromFirebase) {
      setCurrentUser(null);
      setFirebaseUser(null);
      return;
    }
    try {
      const idToken = await userFromFirebase.getIdToken();
      console.log("🔥 AuthContext: Firebase ID Token (for backend sync):", idToken);

      const response = await axiosInstance.post('/users/profile', {});
      console.log("✅ AuthContext: Backend sync response (MongoDB user):", response.data);

      setCurrentUser(response.data);
      localStorage.setItem('userId', response.data._id);
    } catch (error) {
      console.error("❌ AuthContext: Error syncing user with backend:", error.response?.data || error.message);
      setCurrentUser(null);
      // Optionally sign out Firebase user if backend sync fails critically
      // signOut(auth);
    }
  };

  const signup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      setFirebaseUser(userCredential.user);
      await syncUserWithBackend(userCredential.user);

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const login = async ({ email, password, customToken }) => {
    try {
      let userCredential;
      if (customToken) {
        console.log("🔑 AuthContext: Signing in with custom token...", customToken); // Log the token
        userCredential = await signInWithCustomToken(auth, customToken);
      } else if (email && password) {
        console.log("📧 AuthContext: Signing in with email and password...", email);
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        throw new Error("Invalid login credentials provided.");
      }

      setFirebaseUser(userCredential.user);
      await syncUserWithBackend(userCredential.user);

      return userCredential;
    } catch (error) {
      console.error("❌ AuthContext: Login error:", error);
      throw error;
    }
  };
  // --- END REFACTORED LOGIN FUNCTION ---

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      setFirebaseUser(result.user);
      await syncUserWithBackend(result.user);

      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('userId');
      console.log("👋 AuthContext: User logged out.");
    } catch (error) {
      console.error("❌ AuthContext: Error during logout:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔄 AuthContext: onAuthStateChanged fired. User:", user ? user.uid : 'null', "Current loading state:", loading);
      setLoading(true);

      if (user) {
        setFirebaseUser(user);
        await syncUserWithBackend(user);
      } else {
        setCurrentUser(null);
        setFirebaseUser(null);
        localStorage.removeItem('userId');
      }
      setLoading(false);
      console.log("🏁 AuthContext: onAuthStateChanged finished. CurrentUser:", currentUser ? currentUser._id : 'null', "FirebaseUser:", firebaseUser ? firebaseUser.uid : 'null', "Loading:", false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    firebaseUser,
    loading,
    signup, // Keeping signup for completeness, but 2FA path bypasses it
    login,
    logout,
    googleSignIn
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
