import React, { useState, useEffect } from 'react';
import UserCard from './UserCard';
import axiosInstance from "../api/axiosInstance";
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/firebaseConfig'; // <<< Import Firebase auth instance

const SwipeDeck = ({ currentUserId }) => {
  const [users, setUsers] = useState([]);
  const { currentUser } = useAuth(); // <<< Get currentUser from AuthContext

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!currentUser || !currentUser._id) {
          console.warn("SwipeDeck: currentUser not available for fetching users.");
          return;
        }
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            console.error("SwipeDeck: Firebase user not available for getIdToken.");
            return;
        }
        const idToken = await firebaseUser.getIdToken();

        // CHANGE: Request to /api/users/ (which maps to router.get('/') in userRoutes.js)
        const res = await axiosInstance.get(`/users?userId=${currentUserId}`, {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        });
        setUsers(res.data);
      } catch (error) {
        console.error('Error fetching users for swipe deck:', error);
      }
    };
    if (currentUserId && currentUser) { // Ensure currentUser is also ready
        fetchUsers();
    }
  }, [currentUserId, currentUser]); // Add currentUser to dependencies

  const handleSwipe = async (userId, action) => {
    try {
        if (!currentUser || !currentUser._id) {
            console.error("SwipeDeck: currentUser not available for swiping.");
            return;
        }
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            console.error("SwipeDeck: Firebase user not available for getIdToken for swipe.");
            return;
        }
        const idToken = await firebaseUser.getIdToken();

        // CHANGE: Request to /api/users/swipe
        await axiosInstance.post('/users/swipe', {
          userId: currentUserId,
          swipedUserId: userId,
          action,
        }, {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        });
        setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
        console.error('Error during swipe action:', error.response?.data || error.message);
    }
  };

  if (!users.length) return <p className="text-white text-lg">No more users to swipe!</p>;

  return (
    <div className="flex justify-center items-center h-[600px] relative">
      {users.map((user, index) => (
        <UserCard
          key={user._id}
          user={user}
          onSwipeLeft={(id) => handleSwipe(id, 'left')}
          onSwipeRight={(id) => handleSwipe(id, 'right')}
          style={{ zIndex: users.length - index }}
        />
      ))}
    </div>
  );
};

export default SwipeDeck;
