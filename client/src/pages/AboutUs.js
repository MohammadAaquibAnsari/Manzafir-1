import React, { useState, useRef, useEffect } from "react";
import { FaPhoneAlt, FaEnvelope, FaInstagram, FaComments, FaPaperPlane, FaTimes } from "react-icons/fa";
import Navbar from "../components/Navbar";
import dev1 from "../assets/images/manz1.jpg";
import dev2 from "../assets/images/manz2.jpg";
import dev3 from "../assets/images/manz3.jpg";
import dev4 from "../assets/images/manz4.jpg";
import axios from "axios";
import "../styles/Aboutus.css";

const teamMembers = [
  {
    name: "Aditya Nandan",
    role: "UI/UX Designer & Backend Developer",
    bio: "Blending creativity with functionality, our UI/UX designer ensures that every interface is both visually appealing and intuitive. On the backend, they build the architecture that powers our applications, ensuring security, scalability, and efficiency.",
    img: dev1,
  },
  {
    name: "Raj Mane",
    role: "Frontend Developer",
    bio: "Our frontend developer specializes in building dynamic and interactive web applications using React.js. With expertise in modern JavaScript frameworks, component-based architecture, and performance optimization, they ensure a seamless and responsive user experience.",
    img: dev2,
  },
  {
    name: "Aaquib Ansari",
    role: "Machine Learning Engineer",
    bio: "Passionate about AI and data-driven solutions, our machine learning engineer leverages algorithms and predictive models to enhance our applications. From automation to intelligent decision-making, they bring innovation through cutting-edge technology.",
    img: dev3,
  },
  {
    name: "Anushka Sonawane",
    role: "Project Manager",
    bio: "With a keen eye for detail and exceptional organizational skills, our project manager ensures every phase of development runs smoothly. From planning to execution, they maintain clear communication, manage timelines, and deliver successful outcomes.",
    img: dev4,
  },
];

function AboutUs() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([{
    text: "Hi there! Ask me anything about travel, packages, or Manzafir.",
    sender: "bot"
  }]);
  const [userInput, setUserInput] = useState("");
  const chatRef = useRef(null);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { text: userInput, sender: "user" };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setUserInput("");

    try {
      // --- Gemini API Integration START ---

      const geminiMessages = updatedMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; // Using the same env variable name
      
      const MODEL_NAME = "gemini-1.5-flash"; 
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;


      const res = await axios.post(GEMINI_API_URL, {
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
        },
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Ensure the response structure is as expected, especially if no candidates are returned
      let botMessage = "No response from AI.";
      if (res.data && res.data.candidates && res.data.candidates.length > 0 && res.data.candidates[0].content && res.data.candidates[0].content.parts && res.data.candidates[0].content.parts.length > 0) {
        botMessage = res.data.candidates[0].content.parts[0].text;
      }
      setMessages((prev) => [...prev, { text: botMessage, sender: "bot" }]);

      // --- Gemini API Integration END ---

    } catch (error) {
      console.error("Gemini API Error:", error);
      let errorMessage = "Sorry, I couldn't fetch a response. Please contact our team for help.";
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        // This will capture the "models/gemini-pro is not found..." message
        errorMessage = `Error from AI: ${error.response.data.error.message}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      setMessages((prev) => [...prev, { text: errorMessage, sender: "bot" }]);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-300">
      <Navbar />
      <div className="container mx-auto py-12 px-6">
        <h2 className="text-6xl font-extrabold text-center text-blue-700 mb-12 mt-9 animate-pulse">
          Meet Our Team
        </h2>
        <p className="text-center max-w-2xl mx-auto text-gray-700 mb-16 text-xl leading-relaxed">
          We're a team of four passionate professionals, each bringing unique expertise to the table. From crafting beautiful user interfaces to building robust backend systems, managing projects, and exploring cutting-edge machine learning, we work together to create seamless digital experiences.
        </p>

        <div className="grid md:grid-cols-4 gap-16">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white p-8 shadow-2xl rounded-3xl text-center transform transition-transform duration-500 hover:scale-110 hover:shadow-3xl"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-40 h-40 mx-auto rounded-full mb-8 object-cover border-4 border-blue-500 hover:border-blue-700"
              />
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">{member.name}</h3>
              <p className="text-blue-600 font-medium text-xl mb-4">{member.role}</p>
              <p className="text-gray-600 mt-4 text-lg leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center border-4 border-blue-500 rounded-3xl p-12 shadow-xl">
          <h3 className="text-4xl font-extrabold text-blue-700 mb-8">Contact Us</h3>
          <div className="flex justify-center space-x-16">
            <a href="tel:+917039366269" className="flex items-center text-xl text-gray-800 hover:text-blue-600">
              <FaPhoneAlt className="mr-4 text-3xl" /> +91 7039366269
            </a>
            <a href="mailto:help.manzafir@gmail.com" className="flex items-center text-xl text-gray-800 hover:text-blue-600">
              <FaEnvelope className="mr-4 text-3xl" /> help.manzafir@gmail.com
            </a>
            <a href="https://www.instagram.com/aditya_nandan._" target="_blank" rel="noopener noreferrer" className="flex items-center text-xl text-gray-800 hover:text-blue-600">
              <FaInstagram className="mr-4 text-3xl" /> @manzafir
            </a>
          </div>
        </div>

        {/* ChatBot Section */}
        <div className="fixed bottom-8 right-8">
          <button onClick={toggleChat} className="flex items-center bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:bg-blue-700 transition-transform duration-300 hover:scale-110">
            <FaComments className="text-3xl mr-2" />
            Help & Support
          </button>
          {isChatOpen && (
            <div className="fixed bottom-24 right-8 bg-white shadow-2xl rounded-3xl w-80 h-96 flex flex-col">
              <div className="p-4 bg-blue-600 text-white rounded-t-3xl flex justify-between items-center">
                <span>Manzafir AI Bot</span>
                <FaTimes onClick={toggleChat} className="cursor-pointer" />
              </div>
              <div ref={chatRef} className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg, idx) => (
                  <div key={idx} className={msg.sender === "user" ? "text-right" : "text-left"}>
                    <p className="p-2 rounded-lg inline-block mb-2" style={{ background: msg.sender === "user" ? "#DCF8C6" : "#E5E7EB" }}>{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 flex items-center">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-1 p-2 border rounded-l-lg"
                  placeholder="Type your message..."
                />
                <FaPaperPlane onClick={handleSendMessage} className="cursor-pointer text-blue-600 text-2xl ml-2" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AboutUs;