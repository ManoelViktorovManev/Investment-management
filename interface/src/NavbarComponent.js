import React from 'react';
import { HomeComponent } from './HomeComponent.js';
import { UserComponent } from './UserComponent.js';
import { PorfolioComponent } from './PorfolioManagementComponent.js';

const NavbarComponent = ({ setCurrentPage }) => {

  const loadHome = () => setCurrentPage(<HomeComponent />);
  const loadUsers = () => setCurrentPage(<UserComponent />);
  const loadPorfolioSetting = () => setCurrentPage(<PorfolioComponent/>);

  return (
    <nav className="min-w-[200px] h-screen fixed top-0 left-0 bg-gray-900 text-white shadow-lg">
      <div className="flex flex-col h-full p-4 space-y-6">
        <a onClick={loadHome} className="cursor-pointer flex items-center space-x-2 hover:text-gray-400">
          <span>Home</span>
        </a>
        <a onClick={loadUsers} className="cursor-pointer flex items-center space-x-2 hover:text-gray-400">
          <span>Users</span>
        </a>
        <a onClick={loadPorfolioSetting} className="cursor-pointer flex items-center space-x-2 hover:text-gray-400">
          <span>Portfolio</span>
        </a>
      </div>
    </nav>
  );
};

export { NavbarComponent };