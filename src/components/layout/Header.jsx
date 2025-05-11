import React from 'react';

const Header = () => {
  return (
    <header className="flex justify-between items-center px-6 py-4 shadow-md bg-white">
      {/* Left: PurplePass */}
      <div className="text-purple-600 font-semibold text-sm">PurplePass</div>

      {/* Center: Admin button */}
      <button className="bg-gradient-to-r from-purple-500 to-purple-700 text-white text-sm font-medium px-5 py-2 rounded-full shadow-md hover:opacity-90 transition">
        Admin
      </button>

      {/* Right: Points and user icon (SVG) */}
      <div className="flex items-center space-x-2 text-gray-700 text-sm font-medium">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.121 17.804A8.966 8.966 0 0112 15c2.337 0 4.465.894 6.121 2.354M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
    </header>
  );
};

export default Header;
