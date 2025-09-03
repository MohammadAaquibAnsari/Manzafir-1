import RitikaImage from '../assets/images/Ritika Sharma.JPG';
import AdityaImage from '../assets/images/Aditya Mehra.JPG';
import NitaImage from '../assets/images/Nita & Family.JPG';
import React, { useState } from "react"; // Import useState
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence for exit animations

const blogs = [
  {
    title: "A Memorable Solo Escape",
    date: "November 27, 2024",
    author: "Ananya, a solo traveler from Bengaluru",
    description:
      "I’ve always loved traveling solo but struggled to find meaningful experiences beyond generic tours. Manzafir changed that! It recommended a quiet beach retreat in Gokarna, which turned out to be exactly what I needed. The itinerary was perfectly balanced, allowing for exploration and relaxation. I loved the seamless booking process and the genuine recommendations. This wasn't just a trip; it was a journey of self-discovery, thanks to Manzafir!",
    image: RitikaImage,
  },
  {
    title: "An Adventure Made Seamless",
    date: "December 3, 2024",
    author: "Aryan, a solo backpacker from Pune",
    description:
      "When I planned my first solo backpacking trip to Himachal Pradesh, I was nervous about handling everything alone. Enter MANZAFIR—the ultimate game-changer! I found a custom hiking route with budget-friendly hostels, and even connected with a local guide through their platform. The support team was incredibly helpful, providing tips and ensuring I felt safe throughout my journey. I experienced stunning landscapes, vibrant local culture, and made unforgettable memories, all thanks to Manzafir’s intuitive planning and support.",
    image: AdityaImage,
  },
  {
    title: "Family Fun in the Andaman Islands",
    date: "January 15, 2025",
    author: "Nita & Family, adventurers from Mumbai",
    description:
      "Planning a family vacation can be a logistical nightmare, but Manzafir made our Andaman trip a breeze. From kid-friendly activities to comfortable stays, everything was perfectly curated. The highlights included snorkeling at Elephant Beach and exploring the Cellular Jail with an amazing guide who engaged both adults and children. My kids still talk about the clear waters and vibrant marine life! Manzafir took all the stress out of planning, allowing us to simply enjoy our precious family time.",
    image: NitaImage,
  },
];

const BlogPage = () => {
  const [selectedBlog, setSelectedBlog] = useState(null); // State to hold the blog data for the modal

  const openModal = (blog) => {
    setSelectedBlog(blog);
  };

  const closeModal = () => {
    setSelectedBlog(null);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen text-gray-800 px-4 sm:px-8 py-24 sm:py-32">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold text-center text-blue-800 mb-4 tracking-tight"
        >
          Discover Travel Tips & Inspiring Stories
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto leading-relaxed"
        >
          Delve deep into actual experiences by people who believed and chose us.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((blog, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
            >
              <div className="relative h-56 sm:h-64 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span className="absolute bottom-4 left-4 text-white text-xs font-semibold bg-blue-600 px-3 py-1 rounded-full">
                  {blog.date}
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {blog.title}
                </h2>
                <p className="italic text-gray-500 text-sm mb-4">
                  By {blog.author}
                </p>
                <p className="text-gray-700 text-base leading-relaxed line-clamp-3">
                  {blog.description}
                </p>
                <button
                  onClick={() => openModal(blog)} // Changed <a> to <button> and added onClick
                  className="mt-5 inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                >
                  Read More
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    ></path>
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Blog Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={closeModal} // Close modal when clicking outside
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>

              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full h-64 object-cover object-center rounded-lg mb-6"
              />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedBlog.title}
              </h2>
              <p className="italic text-gray-500 text-base mb-4">
                By {selectedBlog.author} on {selectedBlog.date}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {selectedBlog.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogPage;