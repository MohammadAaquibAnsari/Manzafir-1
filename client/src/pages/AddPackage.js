import React, { useState } from 'react';

const AddPackage = () => {
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [travelType, setTravelType] = useState('family');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit package to the backend
    alert(`Package '${packageName}' added!`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-700">Add Your Custom Package</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Package Name"
            value={packageName}
            onChange={(e) => setPackageName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={travelType}
            onChange={(e) => setTravelType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="family">Family-Friendly</option>
            <option value="genZ">Gen Z Adventure</option>
          </select>
          <button type="submit" className="w-full py-2 text-white bg-green-500 rounded-md hover:bg-green-600">Add Package</button>
        </form>
      </div>
    </div>
  );
};

export default AddPackage;
