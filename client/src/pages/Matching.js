import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import SwipeDeck from '../components/SwipeDeck';
import { useAuth } from '../context/AuthContext';
import { MdCompareArrows } from "react-icons/md";
import { auth } from '../firebase/firebaseConfig'; // Import Firebase auth instance

const Matching = () => {
  const { currentUser, loading } = useAuth();
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('swiping');
  const [matchingLoading, setMatchingLoading] = useState(true);
  const [error, setError] = useState('');

  // Helper function to correctly resolve image URLs for matched users
  const getMatchedUserImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://placehold.co/150x150/CCCCCC/000000?text=No+Pic'; // Default placeholder
    }
    // Cloudinary URLs are absolute, so just return them directly
    return imagePath;
  };

  useEffect(() => {
    const fetchMatchedUsers = async () => {
      setMatchingLoading(true);
      setError('');
      try {
        if (!currentUser || !currentUser._id) {
          setError('User data not fully loaded. Please log in.');
          setMatchingLoading(false);
          return;
        }

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            setError("Authentication error. Please re-login.");
            setMatchingLoading(false);
            return;
        }
        const idToken = await firebaseUser.getIdToken();

        // CHANGE: Request to /api/users/matches
        const response = await axiosInstance.get(`/users/matches?userId=${currentUser._id}`, {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        });
        setMatchedUsers(response.data);
      } catch (err) {
        console.error('Error fetching matched users:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch matched users.');
      } finally {
        setMatchingLoading(false);
      }
    };

    if (!loading && currentUser) {
      fetchMatchedUsers();
    } else if (!loading && !currentUser) {
        setError('Please log in to view matching features.');
        setMatchingLoading(false);
    }
  }, [activeTab, currentUser, loading]);

  return (
    <div className="pt-40 bg-gray-900 min-h-screen py-8 relative">
      <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}></div>

      <div className="container mx-auto text-center text-white relative z-10">
        <h1 className="text-5xl font-bold mb-8">Find Your Match</h1>

        <div className="tabs flex justify-center space-x-8 mb-12">
          <button
            onClick={() => setActiveTab('swiping')}
            className={`text-xl p-2 rounded-lg font-medium ${activeTab === 'swiping' ? 'text-pink-500 bg-white ' : 'text-white'} transition duration-300 hover:text-pink-400`}
          >
            Swiping
          </button>
          <div >
            <MdCompareArrows className='ml-16' size={45}/>
          </div>
          <button
            onClick={() => setActiveTab('matched')}
            className={`text-xl p-2 rounded-lg font-medium ${activeTab === 'matched' ? 'text-pink-500 bg-white ' : 'text-white'} transition duration-300 hover:text-pink-400`}
          >
            Matched Users
          </button>
        </div>

        {error && <p className="text-red-400 text-lg mb-4">{error}</p>}

        {activeTab === 'swiping' && (
          <div className="flex justify-center">
            {matchingLoading ? (
              <p>Loading user data...</p>
            ) : currentUser ? (
              <SwipeDeck currentUserId={currentUser._id} />
            ) : (
                <p>Please log in to start swiping.</p>
            )}
          </div>
        )}

        {activeTab === 'matched' && (
          <div className="mt-16">
            <h2 className="text-4xl font-bold mb-6">Matched Users</h2>
            {matchingLoading ? (
                <p className="text-white text-lg">Loading matched users...</p>
            ) : matchedUsers.length > 0 ? (
                <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {matchedUsers.map((matchedUser) => (
                    <li
                    key={matchedUser._id}
                    className="p-6 bg-white bg-opacity-90 rounded-lg shadow-lg text-center hover:scale-105 transform transition duration-300"
                    >
                    <img
                        className="w-24 h-24 mx-auto rounded-full object-cover"
                        src={getMatchedUserImageUrl(matchedUser.profilePicture)} // Use the new helper here
                        alt={matchedUser.name || "Matched User Profile"} // Added alt text
                        onError={(e) => { // Fallback for broken images
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/150x150/CCCCCC/000000?text=No+Pic';
                        }}
                    />
                    <h3 className="mt-4 text-2xl text-black font-semibold">{matchedUser.name}</h3>
                    <p className="mt-2 text-gray-700">{matchedUser.bio || 'No bio available'}</p>
                    <Link
                        to={`/profile/${matchedUser._id}`}
                        className="mt-4 inline-block bg-pink-500 text-white py-2 px-4 rounded-full shadow-lg hover:bg-pink-700 transition duration-300"
                    >
                        View Profile
                    </Link>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-white text-lg">No matched users yet!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matching;
