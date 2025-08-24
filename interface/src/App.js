import React, { useEffect, useState } from 'react';
import './App.css';
import { NavbarComponent } from './NavbarComponent';

import API_BASE_URI from './EnvVar.js';

function App() {
  const [currentPage, setCurrentPage] = useState('');

  const [users, setUsers] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [settings, setSettings] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);

  const [isLoading, setIsLoading] = useState(true);


  // Method that help to format the number 
  const formatPrice = (value) => {
    if (value === null || value === undefined) return null;
    return parseFloat(Number(value).toFixed(4)); // до 4 знака, без излишни нули
  };

  //ок
  const getAllUsers = async () => {
    const res = await fetch(`${API_BASE_URI}/getAllUsers`);
    if (res.ok) {
      var result = await res.json();
      setUsers(result);
      return result;
    }
  };

  //ок
  const getAllPortfolios = async () => {
    const res = await fetch(`${API_BASE_URI}/getAllPortfolios`);
    if (res.ok) {
      var result = await res.json();
      setPortfolios(result);
      return result;
    }
  };

  //ok
  const getAllStocks = async () => {
    const res = await fetch(`${API_BASE_URI}/getAllStocks`);
    if (res.ok) {
      var result = await res.json();
      setStocks(result);
      return result;
    }
  };

  //ok
  const getSettings = async () => {
    const res = await fetch(`${API_BASE_URI}/getSettings`);
    if (res.ok) {
      var result = await res.json();
      setSettings(result);
      return result;
    }

  };

  //ok
  const getExchangeRates = async () => {
    const res = await fetch(`${API_BASE_URI}/getExchangeRates`);
    if (res.ok) {
      var result = await res.json();
      setExchangeRates(result);
      return result;
    }
  };

  const getAllNeededInfromation = async () => {
    const res = await fetch(`${API_BASE_URI}/getAllInfromation`);
    if (res.ok) {
      var result = await res.json();

      const formattedStocks = result["stocks"].map((stock) => ({
        ...stock,
        price: formatPrice(stock.price),
      }));

      setUsers(result["users"]);
      setPortfolios(result["portfolios"]);
      setStocks(formattedStocks);
      setSettings(result["settings"]);
      setExchangeRates(result["exchangeRates"]);
    }
  };
  // Call them all once at start
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        getAllNeededInfromation()
      ]);
      setIsLoading(false);
    };
    loadAllData();
  }, []);

  const data = { users, portfolios, stocks, settings, exchangeRates };
  const refreshMethods = {
    refreshUsers: getAllUsers,
    refreshPortfolios: getAllPortfolios,
    refreshStocks: getAllStocks,
    refreshSettings: getSettings,
    refreshExchangeRates: getExchangeRates,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="loader mb-4" />
          <p className="text-xl text-gray-700">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <NavbarComponent
        setCurrentPage={setCurrentPage}
        data={data}
        refreshMethods={refreshMethods}
      />

      <main className="ml-[200px] flex-grow p-10">
        {currentPage === '' ? (
          <div className="text-center mt-32">
            <h1 className="text-5xl font-bold mb-6">Welcome to the Portfolio Dashboard</h1>
            <p className="text-xl text-gray-700">Select a page from the sidebar to get started.</p>
          </div>
        ) : (
          currentPage
        )}
      </main>
    </div>
  );
}
export default App;