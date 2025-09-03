import React, { useState } from "react";
import backgroundImage from "../assets/contact_img.JPG";


const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Your message has been sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => {
          setSuccessMessage("");
        }, 4000);
      } else {
        throw new Error(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setSuccessMessage("Failed to send message. Try again later.");
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    }
  };
  

  return (
    <div className="flex flex-col min-h-screen bg-gray-800"
       style={{ 
        backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    opacity:20
  }}
      >
        <div className="absolute inset-0 bg-black opacity-70 backdrop-blur-2xl"></div>

      <div className="flex-grow flex justify-center items-center p-15 pt-20">
        <form 
          className="bg-[rgb(31,41,56)] text-white transition duration-500 
              transform hover:scale-105  p-6 rounded-lg shadow-4xl w-full max-w-md"
          onSubmit={handleSubmit}
        >
          <h2 className="text-center font-bold text-3xl mb-10">Send us your Enquiry</h2>
          <label className="block text-blue-300 text-xl mb-2">Name </label>
          <input type="text" name="name" value={formData.name} className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded" required onChange={handleChange} />
          
          <label className="block text-blue-300 text-xl mb-2">Email </label>
          <input type="email" name="email"  value={formData.email} className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded" required onChange={handleChange} />
          
          <label className="block text-blue-300 text-xl mb-2">Phone Number </label>
          <input type="tel" name="phone" value={formData.phone} className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded" required onChange={handleChange} />
          
          <label className="block text-blue-300 text-xl mb-2">Message</label>
          <textarea name="message" value={formData.message} className="w-full p-2 mb-3 bg-gray-700 border border-gray-600 rounded" rows="4" onChange={handleChange}></textarea>
          
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">Submit</button>
          {successMessage && <p className="text-green-400 text-center mt-2">{successMessage}</p>}
        </form>
      </div>

      <div className="bg-gray-900 text-white p-6 mt-60 mb-10 rounded-lg shadow-lg">
{/* Google Map */}
<div className="w-full flex justify-center">
  <iframe
    title="Google Map"
    className="w-full h-64 rounded-lg"
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.62357683767!2d73.81559837581969!3d18.455392571160708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc29510f01ec14f%3A0x283c4e4a79dce985!2sSinhgad%20Institute%20Of%20Technology%20And%20Science%20(SITS)!5e0!3m2!1sen!2sin!4v1743101508148!5m2!1sen!2sin"
    allowFullScreen
    loading="lazy"
  ></iframe>
</div>

{/* Contact Info */}
<div className="mt-6">
  <h2 className="text-xl font-semibold">Get in Touch</h2>
  <p className="mt-2 flex items-center">
    📞 <a href="tel:7039366269" className="ml-2 text-blue-400 hover:underline">703-936-6269</a>
  </p>
  <p className="mt-2 flex items-center">
    ✉️ <a href="mailto:adminish29@gmail.com" className="ml-2 text-blue-400 hover:underline">help.manzafir@gmail.com</a>
  </p>
</div>

{/* Location */}
<div className="mt-6">
  <h2 className="text-xl font-semibold">Location</h2>
  <p className="mt-2 flex items-center">
    📍 Pune, Sinhgad Institute Of Technology And Science , <br />
    <a href="https://www.google.com/maps/place/Sinhgad+Institute+Of+Technology+And+Science+(SITS)" className="text-blue-400 hover:underline">
       Pune, MAHARASHTRA 411041 India
    </a>
  </p>
</div>


  {/* Hours */}
  <div className="mt-6">
    <h2 className="text-xl font-semibold">Hours</h2>
    <ul className="mt-2">
      <li>Monday <span className="text-blue-300">9:00am - 5:00pm</span></li>
      <li>Tuesday: <span className="text-blue-300">9:00am - 5:00pm</span></li>
      <li>Wednesday: <span className="text-blue-300">9:00am - 5:00pm</span></li>
      <li>Thusday: <span className="text-blue-300">9:00am - 5:00pm</span></li>
      <li>Friday: <span className="text-blue-300">9:00am - 5:00pm</span></li>
      <li>Saturday: <span className="text-blue-300">9:00am - 12:00pm</span></li>
      <li>Sunday: <span className="text-blue-300">Closed</span></li>
    </ul>
  </div>
</div>

      
      <footer className="bg-gray-900 text-white py-4 text-center text-sm">© 2025 Manzafir. All Rights Reserved.</footer>
    </div>
  );
};

export default ContactPage;
