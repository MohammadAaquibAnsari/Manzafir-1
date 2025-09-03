import React, { useEffect, useState } from 'react';
import axiosInstance from "../api/axiosInstance";
import { RiUserFollowFill, RiUserUnfollowFill } from "react-icons/ri";
import { useAuth } from '../context/AuthContext'; 
import { auth } from '../firebase/firebaseConfig'; 

const FollowButton = ({ userId, currentUser, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const { firebaseUser } = useAuth(); 

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!firebaseUser || !currentUser) { // Ensure both are available
        console.warn("FollowButton: Not fetching follow status, firebaseUser or currentUser is missing.");
        return;
      }
      try {
        const idToken = await firebaseUser.getIdToken(); // Get the Firebase ID token

        const response = await axiosInstance.get(`/users/${userId}/follow-status`, { // Correct path
          params: { currentUser: currentUser }, // Backend expects this as a query param
          headers: {
            Authorization: `Bearer ${idToken}` 
          }
        });
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error('Error fetching follow status:', error.response?.data || error.message);
      }
    };

    fetchFollowStatus();
  }, [userId, currentUser, firebaseUser]); // Add firebaseUser to dependencies

  const handleFollow = async () => {
    if (!firebaseUser || !currentUser) { // Ensure both are available
        console.error("FollowButton: Cannot perform follow/unfollow, firebaseUser or currentUser is missing.");
        return;
    }
    try {
      const idToken = await firebaseUser.getIdToken(); // Get the Firebase ID token

      const url = isFollowing
        ? `/users/${userId}/unfollow` // Correct path
        : `/users/${userId}/follow`; // Correct path
      
      await axiosInstance.post(url, { userId: currentUser }, { // Send current user's MongoDB ID in body
          headers: {
              Authorization: `Bearer ${idToken}` // <<< Add Authorization header
          }
      });
      setIsFollowing(!isFollowing);
      onFollowChange(isFollowing ? 'unfollow' : 'follow'); // Notify parent component
    } catch (error) {
      console.error('Error during follow/unfollow:', error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to update follow status."); // Use alert for user feedback
    }
  };

  return (
    <button
      onClick={handleFollow}
      className={`p-2 flex gap-2 transition-all duration-300 rounded ${isFollowing ? 'bg-lime-300 hover:bg-lime-700 hover:text-white' : 'bg-cyan-200 hover:bg-cyan-700 hover:text-white'}`}
    >
      {isFollowing ? <RiUserUnfollowFill className='my-auto' /> : <RiUserFollowFill className='my-auto' />}
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
