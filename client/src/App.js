import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import CreateTour from './pages/CreateTour';
import Login from './pages/Login';
import Register from './pages/Signup';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Default import
import PackageDetailPage from './pages/PackageDetailPage';
import Tours from './pages/Tours';
import EditProfile from './pages/EditProfile';
import Matching from './pages/Matching';
import OtherUserProfile from './pages/OtherUserProfile';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import BlogPage from './pages/BlogPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/packages/:packageId" element={<PackageDetailPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/matching" element={<Matching />} />

          {/* Protected Routes */}
          <Route path="/tours" element={
            <ProtectedRoute>
              <Tours />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <OtherUserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/create-tour" element={
            <ProtectedRoute>
              <CreateTour />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;