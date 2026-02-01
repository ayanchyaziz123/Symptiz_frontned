import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 mt-16">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Heart className="w-6 h-6 text-teal-400" />
          <span className="text-xl font-bold text-white">RadTH</span>
        </div>
        <p className="text-sm mb-4">AI-Powered Healthcare Navigation</p>
        <p className="text-xs text-gray-500">
          © 2025 RadTH. Not a substitute for professional medical advice.
        </p>
      </div>
    </footer>
  );
};

export default Footer;