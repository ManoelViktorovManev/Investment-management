import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
import { HomeComponent } from './HomeComponent.js';
import { UserComponent } from './UserComponent.js';
import { TransactionHistoryComponent } from './TransactionHistoryComponent.js';
import { SettingsMenuComponent } from './SettingsMenuComponent.js';

const NavbarComponent = ({ setCurrentPage, data, refreshMethods }) => {
  const navItems = [
    { label: 'Home', action: () => setCurrentPage(<HomeComponent data={data} refreshStocksMethod={refreshMethods.refreshStocks} />) },
    { label: 'Users', action: () => setCurrentPage(<UserComponent data={data} />) },
    {
      label: 'Settings',
      action: () => setCurrentPage(<SettingsMenuWrapper data={data} refreshMethods={refreshMethods} />)
    },
    {
      label: 'Transaction History', action: () => setCurrentPage(<TransactionHistoryComponent title={"Transaction History"}
        fields={["Portfolio", "Stock", "Quantity", "Price", "Date", "Transaction"]} table={"transaction"} />)
    },
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

const SettingsMenuWrapper = ({ data, refreshMethods }) => {
  const [users, setUsers] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [settings, setSettings] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);

  const getAllUsers = async () => {
    var result = await refreshMethods.refreshUsers();
    setUsers(result);
  };

  const getAllPortfolios = async () => {
    var result = await refreshMethods.refreshPortfolios();
    setPortfolios(result);
  };

  const getAllStocks = async () => {
    var result = await refreshMethods.refreshStocks();
    setStocks(result);
  };
  const getSettings = async () => {
    var result = await refreshMethods.refreshSettings();
    setSettings(result);
  };

  const getExchangeRates = async () => {
    var result = await refreshMethods.refreshExchangeRates();
    setExchangeRates(result);
  };

  useEffect(() => {
    setUsers(data.users);
    setPortfolios(data.portfolios);
    setStocks(data.stocks);
    setSettings(data.settings);
    setExchangeRates(data.exchangeRates);
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