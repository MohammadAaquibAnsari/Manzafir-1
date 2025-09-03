import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { IoCalendarOutline, IoPeopleOutline, IoLocationOutline, IoStar, IoChevronForward } from "react-icons/io5";
import { SiAlltrails } from "react-icons/si";
import { TiArrowBack } from "react-icons/ti";
import network from '../assets/network.gif';
import FollowButton from '../components/FollowButton';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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

const OtherUserProfile = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openTours, setOpenTours] = useState([]);
  const [joinedTours, setJoinedTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [showTourDetails, setShowTourDetails] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async (id) => { 
      try {
        const response = await axiosInstance.get(`/users/users/${id}`);
        setProfileData(response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfileData(null);
      }
    };

    const fetchTours = async (id) => { 
      try {
        const toursResponse = await axiosInstance.get('/tours');
        const userCreatedTours = toursResponse.data.filter(tour => tour.creatorId?._id === id);
        const userJoinedTours = toursResponse.data.filter(tour =>
          tour.participants.some(participant => participant?._id === id)
        );
        setOpenTours(userCreatedTours);
        setJoinedTours(userJoinedTours);
      } catch (error) {
        console.error('Error fetching tours:', error);
        setOpenTours([]);
        setJoinedTours([]);
      }
    };

    const initializeData = async () => {
      if (!userId) {
        setLoading(false);
        setProfileData(null);
        return;
      }

      setLoading(true);
      const userData = await fetchUserProfile(userId);
      if (userData && userData._id) {
        await fetchTours(userData._id);
      }
      setLoading(false);
    };

    initializeData();
  }, [userId]);

  const handleDetailsClick = (tour) => {
    setSelectedTour(tour);
    setShowTourDetails(true);
  };

  const handleFollowChange = (action) => {
    setProfileData((prevData) => {
      const currentUserId = currentUser?._id;
      if (!currentUserId) return prevData;

      const followers = action === 'follow'
        ? [...prevData.followers, currentUserId]
        : prevData.followers.filter((followerId) => followerId !== currentUserId);
      return { ...prevData, followers };
    });
  };

  const handleJoinTour = async (tourId) => {
    try {
      if (!currentUser || !currentUser._id) {
        alert("Please log in to join tours.");
        return;
      }

      await axiosInstance.post(`/tours/${tourId}/join`, { userId: currentUser._id });
      setJoinedTours(prevTours => [...prevTours, selectedTour]);
      setShowTourDetails(false);
      alert("Successfully joined the tour!");
    } catch (err) {
      console.error('Error joining tour:', err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to join tour.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-500">User profile not found or failed to load.</div>
      </div>
    );
  }

  // Tour Card Component
  const TourCard = ({ tour, type = "open", onDetailsClick }) => {
    const [currentImage, setCurrentImage] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className="relative pb-60 pt-80 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/1058959/pexels-photo-1058959.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center flex-col">
          <div>
            <img
              src={getProfileImageUrl(profileData.profilePicture)}
              alt={`${profileData.name}'s Profile`}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/150x150/CCCCCC/000000?text=No+Pic';
              }}
            />
            <div className=' flex items-center justify-center flex-col'>
              <h1 className="mt-4 text-3xl font-bold text-white">{profileData.name}</h1>
              <div className="flex justify-center gap-5 text-xl text-gray-300">
                <span>{profileData.followers.length} Followers</span>
                <span>{profileData.following.length} Following</span>
              </div>
              <p className="text-white mb-4 text-sm mt-2">
                {profileData.bio || 'This user has not added a bio.'}
              </p>
              {currentUser && (
                <FollowButton 
                  userId={profileData._id} 
                  currentUser={currentUser._id} 
                  onFollowChange={handleFollowChange} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-10">
        {/* Open Tours Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{profileData.name}'s Open Tours</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {openTours.length > 0 ? (
              openTours.map(tour => (
                <TourCard 
                  key={tour._id} 
                  tour={tour} 
                  type="open" 
                  onDetailsClick={handleDetailsClick}
                />
              ))
            ) : (
              <p className="text-gray-600">No open tours found.</p>
            )}
          </div>
        </section>

        {/* Joined Tours Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{profileData.name}'s Joined Tours</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedTours.length > 0 ? (
              joinedTours.map(tour => (
                <TourCard 
                  key={tour._id} 
                  tour={tour} 
                  type="joined" 
                  onDetailsClick={handleDetailsClick}
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
              
              <div className="flex gap-4">

                
                {currentUser && !selectedTour.participants.some(p => p._id === currentUser._id) && (
                  <button
                    onClick={() => handleJoinTour(selectedTour._id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <img src={network} className="w-5 h-5" alt="Join" />
                    Join Tour
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherUserProfile;