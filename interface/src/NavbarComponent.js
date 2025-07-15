import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
import { HomeComponent } from './HomeComponent.js';
import { UserComponent } from './UserComponent.js';
import { TransactionHistoryComponent } from './TransactionHistoryComponent.js';
import { SettingsMenuComponent } from './SettingsMenuComponent.js';

const NavbarComponent = ({ setCurrentPage, data, refreshMethods }) => {
  const navItems = [
    { label: 'Home', action: () => setCurrentPage(<HomeComponent data={data} refreshStocksMethod={refreshMethods.refreshStocks} />) },
    { label: 'Users', action: () => setCurrentPage(<UserComponent />) },
    {
      label: 'Settings',
      action: () => setCurrentPage(<SettingsMenuWrapper />)
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

const SettingsMenuWrapper = () => {
  const [users, setUsers] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [settings, setSettings] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);

  const getAllUsers = async () => {
    const res = await fetch(`${API_BASE_URI}/getAllUsers`);
    if (res.ok) setUsers(await res.json());
  };

  const getAllPortfolios = async () => {
    const res = await fetch(`${API_BASE_URI}/getAllPortfolios`);
    if (res.ok) setPortfolios(await res.json());
  };

  const getAllStocks = async () => {
    const res = await fetch(`${API_BASE_URI}/getAllStocks`);
    if (res.ok) setStocks(await res.json());
  };
  const getSettings = async () => {
    const res = await fetch(`${API_BASE_URI}/getSettings`);
    if (res.ok) setSettings(await res.json());
  };

  const getExchangeRates = async () => {
    const res = await fetch(`${API_BASE_URI}/getExchangeRates`);
    if (res.ok) setExchangeRates(await res.json());
  };

  useEffect(() => {
    getAllUsers();
    getAllPortfolios();
    getAllStocks();
    getSettings();
    getExchangeRates();
  }, []);

  return (
    <SettingsMenuComponent
      users={users}
      reloadUsers={getAllUsers}
      portfolios={portfolios}
      reloadPortfolios={getAllPortfolios}
      stocks={stocks}
      reloadStocks={getAllStocks}
      settings={settings}
      reloadSettings={getSettings}
      exchangeRates={exchangeRates}
      reloadExchangeRates={getExchangeRates}
    />
  );
};

export { NavbarComponent };