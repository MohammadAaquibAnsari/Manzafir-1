import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { SiAlltrails } from 'react-icons/si';
import { PiArrowBendUpLeftFill, PiArrowBendUpRightFill } from "react-icons/pi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';
import { auth } from '../firebase/firebaseConfig';
// Remove DOMPurify import: import DOMPurify from 'dompurify';

// TourCard Component (nested as before)
const TourCard = ({ tour, handleRequestJoin, handleRequestLeave, currentUserMongoId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = tour.images;
  const [isExpanded, setIsExpanded] = useState(false);

  const isJoined = tour.participants.some(participant => participant._id === currentUserMongoId);

  // Helper function to correctly resolve image URLs for tours
  const getTourImageUrl = (imagePath) => {
    if (!imagePath) {
      // Default placeholder if imagePath is not provided or empty
      return 'https://placehold.co/600x400/CCCCCC/000000?text=No+Tour+Pic';
    }
    // Cloudinary URLs are absolute, so just return them directly
    return imagePath;
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex + 1
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-300">
      {/* Image Slider */}
      <div className="relative w-full h-56">
        {images && images.length > 0 ? ( // Check if images array exists and has content
          <img
            src={getTourImageUrl(images[currentIndex])} // Use the helper function here
            alt={`Tour Image ${currentIndex + 1} for ${tour.name}`} // Improved alt text
            className="w-full h-56 object-cover"
            onError={(e) => { 
              e.target.onerror = null; // Prevents infinite loop
              e.target.src = 'https://placehold.co/600x400/CCCCCC/000000?text=No+Tour+Pic';
            }}
          />
        ) : (
          <img
            src='https://placehold.co/600x400/CCCCCC/000000?text=No+Tour+Pic' // Changed to a generic placeholder
            className="w-full h-56 object-cover"
            alt="Default tour placeholder"
          />
        )}
        {images && images.length > 1 && ( // Only show arrows if there's more than one image
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700"
            >
              <FaChevronRight />
            </button>
          </>
        )}
      </div>

      {/* Tour Info */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{tour.name}</h2>
        {/* Use div with white-space: pre-wrap to preserve line breaks */}
        <div className={`text-gray-600 mb-4 text-sm ${!isExpanded ? 'line-clamp-3' : ''}`} style={{ whiteSpace: 'pre-wrap' }}>
          {tour.description}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:underline text-sm"
        >
          {isExpanded ? 'See Less' : 'See More'}
        </button>

        {tour.packageId && tour.packageId.tourType && (
            <p className="text-gray-700 mb-2">
                <strong>Type:</strong> <span className="font-semibold text-blue-700">{tour.packageId.tourType}</span>
            </p>
        )}

        <p className="text-gray-700 mb-2">
          <strong>Travel Dates:</strong>{' '}
          {new Date(tour.travelDates.start).toLocaleDateString()} -{' '}
          {new Date(tour.travelDates.end).toLocaleDateString()}
        </p>

        <p className="text-gray-700 mb-4">
          <strong>Created By:</strong>{' '}
          <b className="ml-2 text-blue-600 underline underline-offset-2">
            <Link to={`/profile/${tour.creatorId._id}`}>
              @{tour.creatorId.name}
            </Link>
          </b>
        </p>

        <p className="text-gray-700 mb-2">
          <strong>Price :</strong> {tour.price}
        </p>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Participants:</h3>
          <ul className="list-disc pl-5 text-gray-600">
            {tour.participants && tour.participants.length > 0 ? (
              tour.participants.map((user) => <li key={user._id}>{user.name}</li>)
            ) : (
              <li>No participants yet</li>
            )}
          </ul>
        </div>

        {/* Conditional Join/Leave Button - now calls confirmation functions */}
        {isJoined ? (
          <button
            onClick={() => handleRequestLeave(tour._id, tour.name)}
            className="w-fit justify-self-center bg-red-700 flex text-white py-2 px-4 rounded-full text-lg font-semibold hover:bg-red-600 transition duration-300"
          >
            Leave Tour
          </button>
        ) : (
          <button
            onClick={() => handleRequestJoin(tour._id, tour.name)}
            className="w-fit justify-self-center bg-green-900 flex text-white py-2 px-4 rounded-full text-lg font-semibold hover:bg-green-700 transition duration-300"
          >
            <SiAlltrails className="my-auto mx-1" />
            Join Tour
          </button>
        )}
      </div>
    </div>
  );
};

const Tours = () => {
  const { currentUser, loading } = useAuth();
  const [tours, setTours] = useState([]);
  const [error, setError] = useState('');
  const [toursLoading, setToursLoading] = useState(true);

  const [confirmingTour, setConfirmingTour] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      setToursLoading(true);
      try {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          setError('User not authenticated for fetching tours.');
          setToursLoading(false);
          return;
        }

        const idToken = await firebaseUser.getIdToken();

        const response = await axiosInstance.get('/tours', {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });
        setTours(response.data);
      } catch (err) {
        console.error("Error fetching tours:", err.response?.data || err.message);
        setError('Failed to fetch tours. Please try again.');
      } finally {
        setToursLoading(false);
      }
    };

    if (!loading && currentUser) {
      fetchTours();
    } else if (!loading && !currentUser) {
      setError('Please log in to view tours.');
      setToursLoading(false);
    }
  }, [currentUser, loading]);

  const handleRequestJoin = (tourId, tourName) => {
    setConfirmingTour({ id: tourId, name: tourName, action: 'join' });
  };

  const handleRequestLeave = (tourId, tourName) => {
    setConfirmingTour({ id: tourId, name: tourName, action: 'leave' });
  };

  const handleConfirmAction = async (action) => {
    if (!confirmingTour) return;

    const { id: tourId, action: typeOfAction } = confirmingTour;
    setConfirmingTour(null);

    if (action === 'yes') {
      if (typeOfAction === 'join') {
        await executeJoinTour(tourId);
      } else if (typeOfAction === 'leave') {
        await executeLeaveTour(tourId);
      }
    }
  };

  const executeJoinTour = async (tourId) => {
    try {
      const userId = currentUser?._id;
      if (!userId) {
        toast.error("Please login to join tours");
        return;
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
          toast.error("Authentication error. Please re-login.");
          return;
      }
      const idToken = await firebaseUser.getIdToken();

      const response = await axiosInstance.post(
        `/tours/${tourId}/join`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour._id === tourId
            ? { ...tour, participants: [...tour.participants, { _id: userId, name: currentUser.name }] }
            : tour
        )
      );
      toast.success("Successfully joined the tour!");
    } catch (err) {
      console.error('Error joining tour:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to join tour");
    }
  };

  const executeLeaveTour = async (tourId) => {
    try {
      const userId = currentUser?._id;
      if (!userId) {
        toast.error("Please login to leave tours");
        return;
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        toast.error("Authentication error. Please re-login.");
        return;
      }
      const idToken = await firebaseUser.getIdToken();

      const response = await axiosInstance.post(
        `/tours/${tourId}/leave`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      );

      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour._id === tourId
            ? { ...tour, participants: tour.participants.filter(p => p._id !== userId) }
            : tour
        )
      );
      toast.success("Successfully left the tour!");
    } catch (err) {
      console.error('Error leaving tour:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to leave tour");
    }
  };

  return (
    <ProtectedRoute>
      <div
        className="relative bg-cover bg-center min-h-screen text-gray-800"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 pt-32 px-6 py-12">
          <ToastContainer
            stacked
            className="z-50"
            position="top-right"
            autoClose={5000}
            style={{ marginTop: '4rem' }}
          />
          <div className='flex justify-center'>
            <h1 className="text-5xl font-bold text-center text-white mb-8 drop-shadow-lg">
              Explore Amazing Tours
            </h1>
            <div className="text-white flex gap-4 my-auto absolute translate-x-[500px] translate-y-2 group">
              <PiArrowBendUpRightFill
                size={40}
                className="transition-transform duration-300 group-hover:translate-x-[15px]"
              />
              <Link to="/create-tour">
                <button className="text-4xl bg-teal-600 hover:bg-teal-400 transition-all duration-300 px-2 py-1 rounded-xl flex">
                  Create Tour
                </button>
              </Link>
              <PiArrowBendUpLeftFill
                size={40}
                className="transition-transform duration-300 group-hover:translate-x-[-15px]"
              />
            </div>
          </div>
          {error && <p className="text-center text-red-400 text-xl mb-4">{error}</p>}
          {toursLoading ? (
            <p className="text-center text-gray-200 text-xl animate-pulse">
              Loading Open Tours...
            </p>
          ) : (
            tours.length === 0 ? (
                <p className="text-center text-gray-200 text-xl">No tours found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {tours.map((tour) => (
                    <TourCard
                        key={tour._id}
                        tour={tour}
                        handleRequestJoin={handleRequestJoin}
                        handleRequestLeave={handleRequestLeave}
                        currentUserMongoId={currentUser?._id}
                    />
                ))}
                </div>
            )
          )}
        </div>
      </div>

      {confirmingTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {confirmingTour.action === 'join' ? 'Confirm Join Tour' : 'Confirm Leave Tour'}
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to {confirmingTour.action} the tour "<strong>{confirmingTour.name}</strong>"?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleConfirmAction('yes')}
                className={`py-2 px-6 rounded-full text-white font-semibold transition ${
                  confirmingTour.action === 'join' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Yes, {confirmingTour.action === 'join' ? 'Join' : 'Leave'}
              </button>
              <button
                onClick={() => handleConfirmAction('no')}
                className="py-2 px-6 rounded-full bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </ProtectedRoute>
  );
};

export default Tours;