import React from 'react';
import offersBg from '../assets/image/background/Offers-section.jpeg';
import chefImage from '../assets/image/special-offers/chef.jpeg';
import buffetImage from '../assets/image/special-offers/buffet.jpeg';
import romanticDinnerImage from '../assets/image/special-offers/romantic-dinner.jpeg';
import leftWindow from '../assets/image/three-images-window/left-window.jpeg';
import rightWindow from '../assets/image/three-images-window/right-window.jpeg';
import bottomWindow from '../assets/image/three-images-window/bottom window.jpeg';

interface OfferCard {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  discount: string;
}

const Offers: React.FC = () => {
  const offers: OfferCard[] = [
    {
      id: 1,
      title: "Chef's Signature Platter",
      description: "Exquisite selection of gourmet dishes crafted by our award-winning chef",
      price: 450,
      originalPrice: 650,
      image: chefImage,
      discount: "Save 30%"
    },
    {
      id: 2,
      title: "Breakfast Buffet Special",
      description: "All-you-can-eat breakfast buffet with international cuisine",
      price: 280,
      originalPrice: 300,
      image: buffetImage,
      discount: "Save 20%"
    },
    {
      id: 3,
      title: "Romantic Dinner for Two",
      description: "Candlelit dinner with premium wine pairing and dessert",
      price: 1200,
      originalPrice: 1600,
      image: romanticDinnerImage,
      discount: "Save 25%"
    }
  ];

  return (
    <div className="relative min-h-screen py-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={offersBg} 
          alt="Offers Background" 
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-[#001C43] opacity-90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-white text-5xl font-bold mb-4">
            Today's Special Offers
          </h2>
          <p className="text-white text-xl font-light">
            Indulge in our carefully curated dining experiences at exclusive prices
          </p>
        </div>

        {/* Offers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {offers.map((offer) => (
            <div 
              key={offer.id}
              className="bg-white rounded-2xl overflow-hidden shadow-xl transform transition-transform hover:scale-105"
            >
              {/* Card Image */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={offer.image} 
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
                {/* Discount Badge */}
                <div className="absolute top-4 left-4 bg-[#00CD07] text-white px-4 py-2 rounded-lg font-semibold text-sm">
                  {offer.discount}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-gray-900 text-xl font-bold mb-3">
                  {offer.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {offer.description}
                </p>

                {/* Price Section */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-900 text-3xl font-bold">
                      R{offer.price}
                    </span>
                    <span className="text-gray-400 text-lg line-through">
                      R{offer.originalPrice}
                    </span>
                  </div>
                  <button className="bg-[#0F51AF] text-white px-6 py-2.5 rounded-lg hover:bg-[#0d4291] transition-colors font-medium">
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* About Section with Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">About mLodge Hotel</h2>
            <p className="text-lg leading-relaxed mb-6">
              Nestled in the heart of the city, mLodge Hotel offers a perfect blend of modern luxury and 
              timeless elegance. Our commitment to exceptional service and attention to detail ensures 
              every guest enjoys an unforgettable experience.
            </p>
            <p className="text-lg leading-relaxed mb-8">
              With spacious rooms, world-class amenities, and a dedicated team of hospitality professionals, 
              we strive to make your stay comfortable and memorable.
            </p>
            <button className="bg-[#0F51AF] text-white px-8 py-3 rounded-lg hover:bg-[#0d4291] transition-colors font-medium text-lg">
              Join Our Community
            </button>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Left Image */}
            <div className="rounded-2xl overflow-hidden h-64">
              <img 
                src={leftWindow} 
                alt="Hotel Room"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Top Right Image */}
            <div className="rounded-2xl overflow-hidden h-64">
              <img 
                src={rightWindow} 
                alt="Hotel Pool"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom Full Width Image */}
            <div className="col-span-2 rounded-2xl overflow-hidden h-64">
              <img 
                src={bottomWindow} 
                alt="Hotel Dining"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
