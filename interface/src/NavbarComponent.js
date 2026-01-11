import React, { useState, useEffect } from 'react';


const NavbarComponent = ({ setCurrentPage }) => {
  const navItems = [
     { label: 'Users', action: () => setCurrentPage('users') },
     { label: 'Allocation', action: () => setCurrentPage('allocation') },
     { label: 'Settings', action: ()=>setCurrentPage('settings')},
     { label: 'Transaction History, Taxes and Commisions', action: ()=>setCurrentPage('thtc')},
  ];
  return (
    <nav className="min-w-[220px] h-screen fixed top-0 left-0 bg-gray-900 text-white shadow-lg">
      <div className="flex flex-col h-full p-6">
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