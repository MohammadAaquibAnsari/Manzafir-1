import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const PackageDetailPage = () => {
  const { packageId } = useParams();
  const [packageDetail, setPackageDetail] = useState(null);

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
        const response = await axiosInstance.get(`/packages/${packageId}`);
        setPackageDetail(response.data);
      } catch (error) {
        console.error("Error fetching package details", error);
      }
    };

    fetchPackageDetail();
  }, [packageId]);

  if (!packageDetail) return <div>Loading...</div>;

  return (
    <div className="relative min-h-screen">
      {/* Background Image Section */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${packageDetail.imageUrl || 'https://via.placeholder.com/1920x1080'})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 container mx-auto py-20 px-6">
        {/* Package Name */}
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold drop-shadow-lg mb-4">{packageDetail.name}</h1>
          <p className="text-lg drop-shadow-lg max-w-3xl mx-auto">{packageDetail.description}</p>
        </div>

        {/* Details Section */}
        <div className="mt-12 bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto">
          {/* Destinations Section */}
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Destinations</h3>
            <ul className="list-disc pl-5 text-gray-600">
              {(packageDetail.destinations || []).map((destination, index) => (
                <li key={index} className="mt-2">{destination}</li>
              ))}
            </ul>
          </section>

          {/* Activities Section */}
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Activities</h3>
            <ul className="list-disc pl-5 text-gray-600">
              {(packageDetail.activities || []).map((activity, index) => (
                <li key={index} className="mt-2">
                  <strong>{activity.name}</strong>: {activity.description}
                </li>
              ))}
            </ul>
          </section>

          {/* Accommodations Section */}
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Accommodations</h3>
            <ul className="list-disc pl-5 text-gray-600">
              {(packageDetail.raccom || []).map((accommodation, index) => (
                <li key={index} className="mt-2">
                  <strong>{accommodation.name}</strong> - {accommodation.description}
                </li>
              ))}
            </ul>
          </section>

          {/* Call to Action - Book Now */}
          <div className="text-center">
            <Link to="/tours">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-full text-xl font-semibold hover:opacity-90 transition duration-300">
                Join The Fun
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailPage;