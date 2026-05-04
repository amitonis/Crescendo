import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#E0E0D8] bg-white py-8 px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Logo Text with metallic gradient */}
        <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#8a8a8a] via-[#c0c0c0] to-[#8a8a8a] bg-clip-text text-transparent transform transition-all duration-300 hover:scale-105">
          Crescendo
        </div>

        {/* Links */}
        <div className="flex gap-6 text-sm text-[#666660]">
          <a href="#" className="hover:text-[#1A1A1A] transition-colors">About</a>
          <a href="#" className="hover:text-[#1A1A1A] transition-colors">Terms</a>
          <a href="#" className="hover:text-[#1A1A1A] transition-colors">Contact</a>
        </div>

        {/* Copyright */}
        <div className="text-sm text-[#666660]">
          &copy; {new Date().getFullYear()} Silver Ride. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
