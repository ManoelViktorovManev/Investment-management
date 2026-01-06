import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
// import { HomeComponent } from './HomeComponent.js';
import { UserComponent } from './UserComponent.js';
// import { TransactionHistoryComponent } from './TransactionHistoryComponent.js';
// import { SettingsMenuComponent } from './SettingsMenuComponent.js';

const NavbarComponent = ({ setCurrentPage, data, refreshMethods }) => {
  const navItems = [
    { label: 'Users', action: () => setCurrentPage(<UserComponent users={data.users}/>) },
    // {
    //   label: 'Settings',
    //   action: () => setCurrentPage(<SettingsMenuWrapper data={data} refreshMethods={refreshMethods} />)
    // },
    // {
    //   label: 'Transaction History', action: () => setCurrentPage(<TransactionHistoryComponent title={"Transaction History"}
    //     fields={["Portfolio", "Stock", "Quantity", "Price", "Date", "Transaction"]} table={"transaction"} />)
    // },
  ];
console.log(data.users)
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