import React from 'react';
import { HomeComponent } from './HomeComponent.js';
import { UserComponent } from './UserComponent.js';
import { PorfolioComponent } from './PorfolioManagementComponent.js';
import { TransactionHistoryComponent } from './TransactionHistoryComponent.js';

const NavbarComponent = ({ setCurrentPage }) => {
  const navItems = [
    { label: 'Home', action: () => setCurrentPage(<HomeComponent />) },
    { label: 'Users', action: () => setCurrentPage(<UserComponent />) },
    { label: 'Portfolio', action: () => setCurrentPage(<PorfolioComponent />) },
    { label: 'Transaction History', action: () => setCurrentPage(<TransactionHistoryComponent />) },
  ];

  return (
    <nav className="min-w-[220px] h-screen fixed top-0 left-0 bg-gray-900 text-white shadow-lg">
      <div className="flex flex-col h-full p-6">

        {/* Navigation Links */}
        <div className="space-y-3">
          {navItems.map(({ label, action }) => (
            <div
              key={label}
              onClick={action}
              className="cursor-pointer text-sm px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white transition duration-200"
            >
              {label}
            </div>
          ))}
        </div>


      </div>
    </nav>
  );
};

export { NavbarComponent };