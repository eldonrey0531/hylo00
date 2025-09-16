import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* CTA Section */}
        <div className="text-center space-y-6 mb-12">
          <h2 className="text-3xl font-bold">Ready to Book Your Dream Trip?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Let our travel experts create the perfect customized itinerary for
            your next adventure.
          </p>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
            Book a Tour with Us
          </button>
        </div>

        {/* Contact & Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-800">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@hylotravel.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Travel Street, Adventure City</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Services
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Destinations
              </a>
              <a
                href="#"
                className="block text-gray-300 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-400">
          <p>
            &copy; 2025 HYLO Travel. All rights reserved. | Crafted with care
            for adventurous souls.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
