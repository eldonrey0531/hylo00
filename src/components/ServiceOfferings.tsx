import React from 'react';
import {
  CheckCircle,
  Star,
  Award,
  Users,
  MapPin,
  Car,
  UserCheck,
  Plane,
} from 'lucide-react';

const ServiceOfferings: React.FC = () => {
  const features = [
    {
      icon: CheckCircle,
      title: 'Customized Tours',
      description:
        'Tailored experiences based on your preferences and interests.',
    },
    {
      icon: Star,
      title: 'Hassle-free Arrangements',
      description:
        'We handle all the details so you can focus on enjoying your trip.',
    },
    {
      icon: Award,
      title: 'Flexible Rebooking Policy',
      description:
        'Peace of mind with our flexible cancellation and rebooking options.',
    },
  ];

  const packages = [
    {
      name: 'Nature Adventures',
      price: '$399',
      description: 'Perfect for outdoor enthusiasts seeking natural wonders.',
      features: ['Hiking trails', 'Wildlife tours', 'Scenic viewpoints'],
    },
    {
      name: 'Self-Paced Tour',
      price: '$499',
      description: 'Explore at your own rhythm with curated recommendations.',
      features: ['Flexible itinerary', 'Local insights', '24/7 support'],
    },
    {
      name: 'Semi-Guided',
      price: '$599',
      description: 'Best of both worlds with guided highlights and free time.',
      features: ['Expert guides', 'Group activities', 'Personal time'],
    },
    {
      name: 'Fully Guided',
      price: '$799',
      description: 'Complete concierge service with personal guide throughout.',
      features: ['Personal guide', 'All-inclusive', 'Premium experiences'],
    },
  ];

  const services = [
    {
      icon: MapPin,
      title: 'Bespoke Tour Packages',
      description: 'Custom-designed experiences',
    },
    {
      icon: Star,
      title: 'A la Carte Activities',
      description: 'Individual experience booking',
    },
    {
      icon: UserCheck,
      title: 'Certified Activity Guides',
      description: 'Professional local experts',
    },
    {
      icon: Car,
      title: 'Transport & Airport Transfers',
      description: 'Seamless travel logistics',
    },
  ];

  const testimonials = [
    {
      quote:
        'HYLO made our anniversary trip absolutely magical. Every detail was perfect!',
      name: 'Sarah & Mike Thompson',
    },
    {
      quote:
        'The personalized itinerary exceeded our expectations. Highly recommend!',
      name: 'Jennifer Chen',
    },
    {
      quote:
        "Professional service and incredible experiences. We'll definitely book again.",
      name: 'David Rodriguez',
    },
  ];

  return (
    <div className="space-y-16 py-16">
      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="text-center space-y-4">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Icon className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {/* Package Offerings */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Packages
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the perfect travel package that matches your style and
            budget.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {pkg.name}
                </h3>
                <div className="text-3xl font-bold text-teal-600">
                  {pkg.price}
                </div>
                <p className="text-gray-600 text-sm">{pkg.description}</p>
                <ul className="space-y-2 text-sm">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="text-center space-y-3">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                <p className="font-semibold text-gray-900">
                  - {testimonial.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceOfferings;
