import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Helper function to get the correct profile image URL
const getProfileImageUrl = (path) => {
  if (!path) {
    return 'https://www.iconninja.com/files/616/221/174/avatar-account-profile-user-person-face-emoji-icon.png';
  }
  // If the path already looks like a full URL, use it directly
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise, prepend the backend URL for static files
  return `http://localhost:5000/${path}`;
};

const EditProfile = () => {
  const { currentUser, firebaseUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    profilePictureUrl: '',
    travelType: 'family',
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading || !firebaseUser) {
        if (!authLoading && !firebaseUser) {
          setError('Authentication required to edit profile.');
          setLoading(false);
          navigate('/login');
        }
        return;
      }

      try {
        setLoading(true);
        const idToken = await firebaseUser.getIdToken();
        const response = await axiosInstance.get('/users/profile', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const userProfile = response.data;
        setProfileData({
          name: userProfile.name || '',
          email: userProfile.email || '',
          bio: userProfile.bio || '',
          profilePictureUrl: userProfile.profilePicture || '', // Store the raw path from the database
          travelType: userProfile.preferences?.travelType || 'family',
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile for edit:', err.response?.data || err.message);
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, firebaseUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'travelType') {
      setProfileData((prevData) => ({
        ...prevData,
        travelType: value,
      }));
    } else {
      setProfileData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    setProfileImageFile(e.target.files[0]);
    if (e.target.files[0]) {
      setProfileData((prevData) => ({
        ...prevData,
        profilePictureUrl: URL.createObjectURL(e.target.files[0]), // Use object URL for preview
      }));
    } else {
      setProfileData((prevData) => ({
        ...prevData,
        profilePictureUrl: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const idToken = await firebaseUser.getIdToken();
      
      const formData = new FormData();

      formData.append('name', profileData.name);
      formData.append('bio', profileData.bio);
      formData.append('preferences[travelType]', profileData.travelType);

      if (profileImageFile) {
        formData.append('profilePicture', profileImageFile);
      } else if (profileData.profilePictureUrl === '') {
        formData.append('profilePicture', ''); // Send empty string if cleared
      }

      const response = await axiosInstance.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${idToken}`,
        },
      });

      setSuccess('Profile updated successfully!');
      console.log('Profile update response:', response.data);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setProfileImageFile(null);
      
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfileData((prevData) => ({
      ...prevData,
      profilePictureUrl: '',
    }));
    setProfileImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading profile for edit...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Edit Your Profile</h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
                disabled
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
            
            {/* Profile Picture File Upload Input */}
            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                accept="image/*"
              />
              {profileData.profilePictureUrl && (
                <div className="mt-2 flex items-center gap-4">
                  <img
                    src={getProfileImageUrl(profileData.profilePictureUrl)} 
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full object-cover border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove Current Picture
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="travelType" className="block text-sm font-medium text-gray-700">Preferred Travel Type</label>
              <select
                id="travelType"
                name="travelType"
                value={profileData.travelType}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="family">Family</option>
                <option value="genZ">Gen Z</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EditProfile;
