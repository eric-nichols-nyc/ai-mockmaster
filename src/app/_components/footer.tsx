import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">AI Mockmaster</h2>
            <p className="mt-2">Enhancing interview preparation with AI</p>
          </div>
          <div className="w-full md:w-1/3 text-center mb-4 md:mb-0">
            <ul className="inline-flex space-x-4">
              <li><a href="#" className="hover:text-gray-300">Home</a></li>
              <li><a href="#" className="hover:text-gray-300">About</a></li>
              <li><a href="#" className="hover:text-gray-300">Services</a></li>
              <li><a href="#" className="hover:text-gray-300">Contact</a></li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 text-center md:text-right">
            <p>&copy; {new Date().getFullYear()} AI Mockmaster. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;