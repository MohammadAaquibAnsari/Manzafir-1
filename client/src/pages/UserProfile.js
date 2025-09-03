import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
  IoCalendarOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoStar,
  IoChevronForward
} from "react-icons/io5";
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from '../firebase/firebaseConfig';

// Helper function to get the correct profile image URL
const getProfileImageUrl = (path) => {
  if (!path) {
    return 'https://placehold.co/150x150/CCCCCC/000000?text=No+Pic';
  }
  return path;
};

// Helper function to get the correct tour image URL
const getTourImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://placehold.co/600x400/CCCCCC/000000?text=No+Tour+Pic';
  }
  return imagePath; 
};

const UserProfile = () => {
  const { currentUser, firebaseUser, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [openTours, setOpenTours] = useState([]);
  const [joinedTours, setJoinedTours] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [selectedTour, setSelectedTour] = useState(null);
  const [showTourDetails, setShowTourDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLocalLoading(true);
      setError('');
      try {
        if (!firebaseUser) {
            console.warn("UserProfile: No firebaseUser available. Cannot get ID token.");
            setError('Authentication required to load profile.');
            return;
        }

        const idToken = await firebaseUser.getIdToken();
        console.log("🔑 UserProfile: Obtained Firebase ID Token for API calls.");

        const [profileRes, toursRes] = await Promise.all([
          axiosInstance.get('/users/profile', {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          }),
          axiosInstance.get('/tours', {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          })
        ]);

        if (!profileRes?.data) {
          throw new Error('Profile data not found');
        }

        setProfileData(profileRes.data);
        
        const userCreatedTours = toursRes.data.filter(tour => 
          tour.creatorId?._id === profileRes.data._id || 
          tour.creatorId?.firebaseUid === firebaseUser.uid
        );
        
        const userJoinedTours = toursRes.data.filter(tour => 
          tour.participants.some(participant => 
            participant._id === profileRes.data._id || 
            participant.firebaseUid === firebaseUser.uid
          )
        );

        setOpenTours(userCreatedTours);
        setJoinedTours(userJoinedTours);
      } catch (err) {
        console.error("❌ UserProfile: Error fetching profile data:", err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load profile data.');
      } finally {
        setLocalLoading(false);
      }
    };

    if (!authLoading && currentUser && firebaseUser) { 
      fetchData();
    } else if (!authLoading && (!currentUser || !firebaseUser)) { 
        setLocalLoading(false);
        setError('Please log in to view your profile.');
    } else if (authLoading) {
        setLocalLoading(true);
    }
  }, [currentUser, firebaseUser, authLoading]);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleDetailsClick = (tour) => {
    setSelectedTour(tour);
    setShowTourDetails(true);
  };

  const handleTourFavoriteChange = async (tourId, isFavoriting) => {
    if (!currentUser || !firebaseUser) {
      toast.error("Cannot favorite/unfavorite tour: User not authenticated.");
      return;
    }
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await axiosInstance.post(
        '/users/favorite-tours',
        { tourId },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      setProfileData(prevProfileData => {
        const newFavoriteTours = isFavoriting
          ? [...(prevProfileData.favoriteTours || []), tourId]
          : (prevProfileData.favoriteTours || []).filter(id => id !== tourId);
        return { ...prevProfileData, favoriteTours: newFavoriteTours };
      });
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error updating tour favorite status:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to update tour favorite status.');
    }
  };

  if (localLoading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl text-gray-700">Loading profile...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl text-red-500">{error}</div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <ToastContainer
          stacked
          className="z-50"
          position="top-right"
          autoClose={5000}
          style={{ marginTop: '4rem' }}
        />
        {/* Profile Header */}
        <div
          className="relative pb-60 pt-80 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center flex-col">
            <div>
              {profileData && (
                <>
                  <img
                    src={getProfileImageUrl(profileData.profilePicture)}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/150x150/CCCCCC/000000?text=No+Pic';
                    }}
                  />
                  <div className='text-center'>
                    <h1 className="mt-4 text-3xl font-bold text-white">{profileData.name || (firebaseUser ? firebaseUser.displayName : 'Guest')}</h1>
                    <div className="flex justify-center gap-5 text-xl text-gray-300">
                      <span>{profileData.followers?.length || 0} Followers</span>
                      <span>{profileData.following?.length || 0} Following</span>
                    </div>
                    <p className="text-white w-2/3 mx-auto text-center text-sm mt-2">
                      {profileData.bio || 'This user has not added a bio.'}
                    </p>
                    <button
                      className="my-4 mx-auto bg-white text-indigo-600 py-2 px-4 rounded-full flex items-center space-x-2 shadow-md hover:shadow-lg transition duration-300"
                      onClick={handleEditProfile}
                    >
                      <FaEdit className="text-indigo-600" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-10">
          {/* Open Tours Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Open Tours</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {openTours.length > 0 ? (
                openTours.map(tour => (
                  <TourCard 
                    key={tour._id} 
                    tour={tour} 
                    type="open" 
                    onDetailsClick={() => handleDetailsClick(tour)}
                    userFavoriteTours={profileData.favoriteTours || []} 
                    onToggleFavorite={handleTourFavoriteChange}
                  />
                ))
              ) : (
                <p className="text-gray-600">No open tours found.</p>
              )}
            </div>
          </section>

          {/* Joined Tours Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Joined Tours</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedTours.length > 0 ? (
                joinedTours.map(tour => (
                  <TourCard 
                    key={tour._id} 
                    tour={tour} 
                    type="joined" 
                    onDetailsClick={() => handleDetailsClick(tour)}
                    userFavoriteTours={profileData.favoriteTours || []} 
                    onToggleFavorite={handleTourFavoriteChange}
                  />
                ))
              ) : (
                <p className="text-gray-600">No joined tours found.</p>
              )}
            </div>
          </section>
        </div>

        {/* Tour Details Modal */}
        {showTourDetails && selectedTour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold">{selectedTour.name}</h3>
                  <button 
                    onClick={() => setShowTourDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                {selectedTour.images?.length > 0 && (
                  <img
                    src={getTourImageUrl(selectedTour.images[0])}
                    alt={selectedTour.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                
                <div className="mb-4">
                  <h4 className="font-semibold text-lg mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedTour.description || "No description provided."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold">Dates</h4>
                    <p>
                      {new Date(selectedTour.travelDates.start).toLocaleDateString()} - 
                      {new Date(selectedTour.travelDates.end).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Price</h4>
                    <p>₹{selectedTour.price?.toLocaleString() || "N/A"}</p>
                  </div>
                  {selectedTour.destination && (
                    <div>
                      <h4 className="font-semibold">Destination</h4>
                      <p>{selectedTour.destination}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">Participants</h4>
                    <p>{selectedTour.participants?.length || 0} joined</p>
                  </div>
                </div>
                
                {/* <button
                  onClick={() => {
                    setShowTourDetails(false);
                    navigate(`/tours/${selectedTour._id}`);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  View Full Tour Page
                </button> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

// Tour Card Component
const TourCard = ({ tour, type = "open", onDetailsClick, userFavoriteTours, onToggleFavorite }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(userFavoriteTours.includes(tour._id));

  useEffect(() => {
    setIsFavorite(userFavoriteTours.includes(tour._id));
  }, [userFavoriteTours, tour._id]);

  const changeImage = (index) => {
    setCurrentImage(index);
  };

  const nextSlide = () => {
    setCurrentImage((prevIndex) =>
      prevIndex === tour.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentImage((prevIndex) =>
      prevIndex === 0 ? tour.images.length - 1 : prevIndex - 1
    );
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    onToggleFavorite(tour._id, newFavoriteStatus);
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onDetailsClick(tour)}
    >
      {/* Image Slider */}
      <div className="relative h-48 w-full overflow-hidden">
        {tour.images?.length > 0 ? (
          <img
            src={getTourImageUrl(tour.images[currentImage])}
            alt={`Tour Image ${currentImage + 1} for ${tour.name}`}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x400/CCCCCC/000000?text=No+Tour+Pic';
            }}
          />
        ) : (
          <img
            src="https://placehold.co/600x400/CCCCCC/000000?text=No+Tour+Pic"
            alt="Default tour placeholder"
            className="w-full h-full object-cover"
          />
        )}
        
        {tour.images?.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 z-10"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700 z-10"
            >
              <FaChevronRight />
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {tour.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    changeImage(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentImage ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
                />
              ))}
            </div>
          </>
        )}
        
        <button 
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full backdrop-blur-sm z-10"
        >
          {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-600" />}
        </button>
        
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/80 rounded-full backdrop-blur-sm text-sm font-medium z-10">
          {type === "open" ? "Hosting" : "Joined"}
        </div>
      </div>
      
      {/* Tour Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-bold text-gray-800">{tour.name}</h4>
          <div className="flex items-center text-amber-400">
            <IoStar className="fill-current" />
            <span className="ml-1 text-gray-700">4.8</span>
          </div>
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-gray-600">
            <IoCalendarOutline className="mr-2 text-blue-500" />
            <span>
              {new Date(tour.travelDates.start).toLocaleDateString()} - {new Date(tour.travelDates.end).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <IoPeopleOutline className="mr-2 text-purple-500" />
            <span>{tour.participants?.length || 0} participants</span>
          </div>
          
          {tour.destination && (
            <div className="flex items-center text-gray-600">
              <IoLocationOutline className="mr-2 text-red-500" />
              <span>{tour.destination}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDetailsClick(tour);
            }}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            View details <IoChevronForward className="ml-1" />
          </button>
          
          <span className="text-lg font-bold text-gray-800">
            ₹{tour.price?.toLocaleString() || "N/A"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;