
import React from 'react';
import { MenuIcon, UserCircleIcon } from './icons/Icons';

interface HeaderProps {
  onMenuClick: () => void;
  adminPhoto?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, adminPhoto }) => {
  return (
    <header className="bg-dark-teal text-white shadow-md">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuClick} className="text-white md:hidden">
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            {adminPhoto ? (
              <img
                src={adminPhoto}
                alt="Admin"
                className="h-8 w-8 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <UserCircleIcon className="h-8 w-8" />
            )}
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
