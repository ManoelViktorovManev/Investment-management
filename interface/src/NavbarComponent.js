import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
import { HomeComponent } from './HomeComponent.js';
import { UserComponent } from './UserComponent.js';
import { PorfolioComponent } from './PorfolioManagementComponent.js';
import { TransactionHistoryComponent } from './TransactionHistoryComponent.js';
import { SettingsMenuComponent } from './SettingsMenuComponent.js';

const NavbarComponent = ({ setCurrentPage }) => {
  const [users, setUsers] = useState([]);

  const getAllUsersData = async () => {
    const response = await fetch(`${API_BASE_URI}/getAllUsers`, {
      method: 'GET'
    });
    if (response.status !== 200) {
      alert("Problem trying to get all Users");
    } else {
      const data = await response.json();
      setUsers(data);
    }
  };

  useEffect(() => {
    getAllUsersData();
  }, []);

  const navItems = [
    { label: 'Home', action: () => setCurrentPage(<HomeComponent />) },
    { label: 'Users', action: () => setCurrentPage(<UserComponent />) },
    { label: 'Portfolio', action: () => setCurrentPage(<PorfolioComponent />) },
    {
      label: 'Settings',
      action: () => setCurrentPage(
        <SettingsMenuWrapper
          users={users}
          reloadUsers={getAllUsersData}
        />
      )
    },
    { label: 'Transaction History', action: () => setCurrentPage(<TransactionHistoryComponent />) },
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

const SettingsMenuWrapper = ({ users, reloadUsers }) => {
  const [localUsers, setLocalUsers] = useState(users);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  return <SettingsMenuComponent users={localUsers} reloadUsers={reloadUsers} />;
};

export { NavbarComponent };