import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import backgroundImage from '../assets/image/background/Offers-section.jpeg';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <Navigation
        hideNavButtons={true}
        showBackButton={true}
        onBackClick={handleBackClick}
      />

      {/* Hero Section */}
      <div className="relative h-48">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Terms and Conditions"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#001F3F]/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 pt-16">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-8 text-center">Terms and Conditions</h1>
          <p className="text-white text-base md:text-lg text-center max-w-2xl">
            Please read these terms and conditions carefully before using our services.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using the mLodge Hotel booking platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily access the materials (information or software) on mLodge Hotel's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>attempt to decompile or reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking Terms</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Reservation Process</h3>
              <p className="text-gray-700 mb-4">
                All bookings are subject to availability and confirmation. When you make a booking through our platform, you are entering into a contract with the accommodation provider. We act as an intermediary and are not responsible for the services provided by the accommodation.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Payment Terms</h3>
              <p className="text-gray-700 mb-4">
                Payment is required at the time of booking unless otherwise specified. We accept various payment methods as indicated during the booking process. All payments are processed securely through our payment partners.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Cancellation Policy</h3>
              <p className="text-gray-700 mb-4">
                Cancellation policies vary by accommodation and are clearly stated during the booking process. Generally:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Free cancellation up to 48 hours before check-in for most bookings</li>
                <li>Late cancellations or no-shows may incur full charges</li>
                <li>Special rates may have different cancellation terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Account Information</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Accurate Information</h3>
              <p className="text-gray-700 mb-4">
                You agree to provide accurate, current, and complete information during the registration and booking process. You agree to update your information to keep it accurate and current.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Prohibited Uses</h3>
              <p className="text-gray-700 mb-4">
                You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Service Availability</h2>
              <p className="text-gray-700 mb-4">
                We strive to keep our service available 24/7, but we do not guarantee that the service will always be available, uninterrupted, or error-free. We reserve the right to modify, suspend, or discontinue the service at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall mLodge Hotel or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform, even if mLodge Hotel or our authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of South Africa, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> info@codetribehotel.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +27 79 946 7887</p>
                <p className="text-gray-700"><strong>Address:</strong> 123 Pretorious St, Pretoria</p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600 text-sm text-center">
                By using our service, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
