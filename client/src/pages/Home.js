import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vid1 from '../assets/mainvid.mp4';
import vid2 from '../assets/mainvid2.mp4';
import bg from '../assets/photo.jpg';

import {
  IoReload,
  IoLocationOutline,
  IoPeopleOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoStar,
  IoAirplane,
  IoBed,
  IoRestaurant,
  IoCar,
  IoTime,
  IoLeaf
} from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const DestinationCard = ({ destination, index }) => {
  const [showMore, setShowMore] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    },
    hover: { y: -10 }
  };

  const infoVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Destination Image */}
        <div className="h-48 w-full rounded-xl overflow-hidden mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <img
            src={destination.recommended_destinations.image || "https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
            alt={destination.recommended_destinations.name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
          />
          <div className="absolute bottom-4 left-4 z-20">
            <h3 className="text-3xl font-bold text-white">
              {destination.recommended_destinations.name}
            </h3>
            <div className="flex items-center text-yellow-300 mt-1">
              {[...Array(5)].map((_, i) => (
                <IoStar key={i} className={i < destination.recommended_destinations.rating ? "fill-current" : "text-gray-300"} />
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 italic text-center px-4">
          {destination.recommended_destinations.description}
        </p>

        {/* Quick Facts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-700">
            <IoCashOutline className="mr-2 text-emerald-500" />
            <span>₹{destination.estimated_costs.total_cost}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <IoCalendarOutline className="mr-2 text-blue-500" />
            <span>{destination.best_time_to_visit.recommended_months[0]}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <IoTime className="mr-2 text-purple-500" />
            <span>{destination.travel_logistics.travel_duration}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <IoAirplane className="mr-2 text-red-500" />
            <span>{destination.travel_logistics.recommended_transport}</span>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="mb-6">
          <h4 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
            <IoLeaf className="mr-2 text-green-500" /> Highlights
          </h4>
          <ul className="grid grid-cols-2 gap-2">
            {destination.recommended_destinations.highlights.slice(0, 4).map((highlight, idx) => (
              <li key={idx} className="flex items-start text-gray-700">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-2"></span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Show More Content */}
        <AnimatePresence>
          {showMore && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={infoVariants}
              className="overflow-hidden"
            >
              {/* Estimated Costs */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
                  <IoCashOutline className="mr-2 text-emerald-500" /> Costs Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Flights</p>
                    <p className="font-medium">₹{destination.estimated_costs.flights}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Accommodation</p>
                    <p className="font-medium">₹{destination.estimated_costs.accommodation}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Daily Expenses</p>
                    <p className="font-medium">₹{destination.estimated_costs.daily_expenses}</p>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded">
                    <p className="text-gray-500">Total</p>
                    <p className="font-bold text-emerald-600">₹{destination.estimated_costs.total_cost}</p>
                  </div>
                </div>
              </div>

              {/* Accommodation */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
                  <IoBed className="mr-2 text-blue-500" /> Accommodation
                </h4>
                {destination.accommodation.map((accom, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{accom.type}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {accom.price_range}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {accom.suggested_options.map((option, optionIdx) => (
                        <li key={optionIdx} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2"></span>
                          <span>{option}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Travel Logistics */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
                  <IoCar className="mr-2 text-purple-500" /> Travel Logistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Transport</p>
                    <p className="font-medium">{destination.travel_logistics.recommended_transport}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-medium">{destination.travel_logistics.travel_duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Visa</p>
                    <p className="font-medium">{destination.travel_logistics.visa_requirements}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Local Transport</p>
                    <p className="font-medium">{destination.travel_logistics.local_transportation}</p>
                  </div>
                </div>
              </div>

              {/* Best Time to Visit */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
                  <IoCalendarOutline className="mr-2 text-red-500" /> Best Time to Visit
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Recommended</p>
                    <p className="font-medium">{destination.best_time_to_visit.recommended_months.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Weather</p>
                    <p className="font-medium">{destination.best_time_to_visit.weather}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Peak Season</p>
                    <p className="font-medium">{destination.best_time_to_visit.peak_season}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Off-Peak</p>
                    <p className="font-medium">{destination.best_time_to_visit.off_peak_season}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show More Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {showMore ? 'Show Less' : 'View Full Details'}
            <IoChevronDownOutline className={`ml-2 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const [packages, setPackages] = useState([]);
  const [recommendedDestinations, setRecommendedDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    budget: "20000",
    starting_location: "mumbai",
    group_size: "2",
    preference_type: "beaches"
  });

  // Available options
  const budgetOptions = [
    { value: "10000", label: "₹10,000" },
    { value: "20000", label: "₹20,000" },
    { value: "30000", label: "₹30,000" },
    { value: "50000", label: "₹50,000" },
    { value: "75000", label: "₹75,000" },
    { value: "100000", label: "₹1,00,000+" }
  ];

  const locationOptions = [
    { value: "mumbai", label: "Mumbai" },
    { value: "delhi", label: "Delhi" },
    { value: "bangalore", label: "Bangalore" },
    { value: "hyderabad", label: "Hyderabad" },
    { value: "chennai", label: "Chennai" },
    { value: "kolkata", label: "Kolkata" }
  ];

  const groupSizeOptions = [
    { value: "1", label: "Solo" },
    { value: "2", label: "Couple" },
    { value: "4", label: "Family (4)" },
    { value: "6", label: "Group (6)" },
    { value: "10", label: "Large Group (10+)" }
  ];

  const preferenceOptions = [
    { value: "beaches", label: "Beaches" },
    { value: "mountains", label: "Mountains" },
    { value: "historical", label: "Historical" },
    { value: "adventure", label: "Adventure" },
    { value: "wildlife", label: "Wildlife" },
    { value: "spiritual", label: "Spiritual" },
    { value: "culinary", label: "Food & Culture" }
  ];

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axiosInstance.get('/packages');
        setPackages(response.data);
      } catch (error) {
        console.error('Error fetching packages', error);
      }
    };

    fetchPackages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('http://127.0.0.1:8000/recommend_travel', formData);
      const jsonResponse = JSON.parse(response.data.recommendation);
      console.log('Parsed Response:', jsonResponse);
      setRecommendedDestinations(jsonResponse);
    } catch (error) {
      console.error('Error calling API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2">
          <video
            src={vid1}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover opacity-70"
          ></video>
          <video
            src={vid2}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover opacity-70"
          ></video>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <motion.div
            className="text-white text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className='flex gradient gap-2 flex-wrap justify-center'>
              <h1 className="text-6xl md:text-8xl font-light mb-4 bg-gradient-to-r from-sky-500 to-white text-transparent bg-clip-text">Explore</h1>
              <h1 className="text-6xl md:text-8xl mb-4 bg-gradient-to-r from-white to-lime-500 text-transparent bg-clip-text">Discover</h1>
              <h1 className="text-6xl md:text-8xl mb-4 bg-gradient-to-r from-amber-400 to-white text-transparent bg-clip-text">Travel</h1>
            </div>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto mt-6">
              Let us craft your perfect getaway based on your preferences
            </p>
          </motion.div>
        </div>
      </div>

      {/* Recommendation Form */}
      <section className="py-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Tell Us About Your Dream Trip
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Budget */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <IoCashOutline className="mr-2 text-emerald-500" />
                  Your Budget
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {budgetOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Starting Location */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <IoLocationOutline className="mr-2 text-blue-500" />
                  Starting From
                </label>
                <select
                  name="starting_location"
                  value={formData.starting_location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {locationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Group Size */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <IoPeopleOutline className="mr-2 text-purple-500" />
                  Traveling With
                </label>
                <select
                  name="group_size"
                  value={formData.group_size}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {groupSizeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Preference */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <IoStar className="mr-2 text-amber-400" />
                  Travel Preference
                </label>
                <select
                  name="preference_type"
                  value={formData.preference_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {preferenceOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Finding Recommendations...
                    </>
                  ) : (
                    <>
                      Get Personalized Recommendations
                      <IoReload className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Travel Packages</h2>
          <div className="space-y-12">
            {packages.map((pkg, index) => (
              <PackageCard key={pkg._id} pkg={pkg} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Destinations */}
      {recommendedDestinations.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
                Personalized Recommendations
              </h2>
              <p className="text-xl text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                We've curated these destinations just for you based on your preferences
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedDestinations.map((destination, index) => (
                  <DestinationCard
                    key={index}
                    destination={destination}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

const PackageCard = ({ pkg, index }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalTime = 3000; // 3 seconds

  useEffect(() => {
    // Only start slideshow if there are images and more than one
    if (pkg.images && pkg.images.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentImageIndex(prevIndex =>
          (prevIndex + 1) % pkg.images.length
        );
      }, intervalTime);

      // Cleanup function to clear the interval
      return () => clearInterval(intervalId);
    }
  }, [pkg.images, intervalTime]);

  // Helper function to resolve image URL, similar to profile pictures
  const getPackageImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://placehold.co/600x400/CCCCCC/000000?text=No+Image'; // Fallback
    }
    // If the path is already a full URL, use it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Otherwise, prepend the backend URL for static files
    return `http://localhost:5000/${imagePath}`;
  };

  return (
    <motion.div
      className={`flex flex-col lg:flex-row ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''} items-center bg-gray-50 rounded-2xl shadow-lg overflow-hidden`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      {/* Image Section */}
      <div className="lg:w-1/2 w-full h-64 lg:h-96 relative overflow-hidden">
        {pkg.images && pkg.images.length > 0 ? (
          <AnimatePresence initial={false} mode="wait">
            <motion.img
              key={currentImageIndex} // Key on index, as image paths can sometimes be identical if default is used
              src={getPackageImageUrl(pkg.images[currentImageIndex])} // Use the helper function here
              alt={pkg.name}
              className="w-full h-full object-cover absolute top-0 left-0"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: '0%', opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </AnimatePresence>
        ) : (
          // Fallback image if no images are available
          <img
            src="https://placehold.co/600x400/CCCCCC/000000?text=No+Image"
            alt="No Image Available"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Manual pagination buttons */}
        {pkg.images && pkg.images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
            {pkg.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 w-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-black w-6' : 'bg-gray-400'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="lg:w-1/2 w-full p-8 flex flex-col justify-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">{pkg.name}</h3>
        <p className="text-gray-600 mb-4 text-lg">{pkg.description}</p>
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-700 mb-2">Destinations:</h4>
          <ul className="grid grid-cols-2 gap-2">
            {(pkg.destinations || []).map((destination, idx) => (
              <li key={idx} className="flex items-center text-gray-600">
                <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                {destination}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to={`/packages/${pkg._id}`}
          className="bg-gradient-to-r from-sky-500 to-blue-600 w-fit text-white py-3 px-8 rounded-full text-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default HomePage;
