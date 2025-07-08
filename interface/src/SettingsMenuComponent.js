import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
import PriceUpdateTable from './PriceUpdateTable.js';

const SettingsMenuComponent = ({ users, reloadUsers, portfolios, reloadPortfolios, stocks, reloadStocks, settings, reloadSettings }) => {
  const [activeSection, setActiveSection] = useState(null);

  // User state
  const [userName, setUserName] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUserName, setEditedUserName] = useState('');

  // Portfolio state
  const [portfolioName, setPortfolioName] = useState('');
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [editedPortfolioName, setEditedPortfolioName] = useState('');

  // Stock state
  const [buttonForUpdatePrices, setbuttonForUpdatePrices] = useState(false);
  const [buttonForSetDefaultCurrency, setButtonForSetDefaultCurrency] = useState(false);
  const [buttonForSetCurrencyRates, setButtonForSetCurrencyRates] = useState(false);

  //states for every stock price change
  const [updatedStocks, setUpdatedStocks] = useState([]);

  // Settings state
  const [newDefaultCurrency, setNewDefaultCurrency] = useState('');
  const [currentDefaultCurrency, setCurrentDefaultCurrency] = useState('');

  useEffect(() => {
    setUpdatedStocks([...stocks]);
    setCurrentDefaultCurrency(settings.defaultCurrency);
  }, [stocks, settings]);

  // USER FUNCTIONS
  async function addNewUser() {
    if (!userName.trim()) return alert("User name cannot be empty");
    const response = await fetch(`${API_BASE_URI}/createNewUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName })
    });
    if (response.status !== 200) return alert("Problem trying to create a new user");
    setUserName('');
    reloadUsers();
  }

  async function removeUser(id) {
    const response = await fetch(`${API_BASE_URI}/deleteUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (response.status !== 200) return alert("Problem trying to delete the user");
    reloadUsers();
  }

  async function updateUser(id) {
    if (!editedUserName.trim()) return alert("User name cannot be empty");
    const response = await fetch(`${API_BASE_URI}/updateUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editedUserName })
    });
    if (response.status !== 200) return alert("Problem updating user");
    setEditingUserId(null);
    setEditedUserName('');
    reloadUsers();
  }

  // PORTFOLIO FUNCTIONS
  async function addNewPortfolio() {
    if (!portfolioName.trim()) return alert("Portfolio name cannot be empty");
    const response = await fetch(`${API_BASE_URI}/createNewPortfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: portfolioName })
    });
    if (response.status !== 200) return alert("Problem trying to create a new portfolio");
    setPortfolioName('');
    reloadPortfolios();
  }

  async function removePortfolio(id) {
    const response = await fetch(`${API_BASE_URI}/deletePortfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (response.status !== 200) return alert("Problem trying to delete portfolio");
    reloadPortfolios();
  }

  async function updatePortfolio(id) {
    if (!editedPortfolioName.trim()) return alert("Portfolio name cannot be empty");
    const response = await fetch(`${API_BASE_URI}/updatePortfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editedPortfolioName })
    });
    if (response.status !== 200) return alert("Problem updating portfolio");
    setEditingPortfolioId(null);
    setEditedPortfolioName('');
    reloadPortfolios();
  }

  // STOCK METHODS
  const handlePriceChange = (id, newPrice) => {
    setUpdatedStocks(prev =>
      prev.map(stock =>
        stock.id === id ? { ...stock, price: newPrice } : stock
      )
    );
  };

  async function updateAllStocksPrice() {
    try {
      var allocations = {};

      for (const stock of updatedStocks) {
        allocations[stock.id] = parseFloat(stock.price);
      }

      const response = await fetch(`${API_BASE_URI}/updateStock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations: allocations })
      });

      if (!response.ok) {
        throw new Error(`Failed to update stock prices`);
      }
    } catch (error) {
      console.error("Update error:", error);
    }

  }

  //SETTINGS METHODS

  async function updateSettings() {
    if (!newDefaultCurrency.trim()) return alert("Settings name cannot be empty");
    const response = await fetch(`${API_BASE_URI}/updateSettings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultCurrency: newDefaultCurrency })
    });
    if (response.status !== 200) return alert("Problem updating settings");
    setNewDefaultCurrency('');
    reloadSettings();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="space-x-4 mb-6">
        {['user', 'portfolio', 'stock'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-md ${activeSection === section ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)} Settings
          </button>
        ))}
      </div>

      {/* USER SETTINGS */}
      {activeSection === 'user' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">User Settings</h2>
          <p className="mb-4">Add, edit, or remove users.</p>

          <div className="flex gap-2 mb-4">
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="New user name"
              className="border px-3 py-1 flex-1"
            />
            <button onClick={addNewUser} className="bg-green-500 text-white px-4 py-1 rounded">
              Create User
            </button>
          </div>

          <ul className="space-y-3">
            {users.map((user) => (
              <li key={user.id} className="border p-3 rounded flex items-center justify-between">
                {editingUserId === user.id ? (
                  <>
                    <input
                      className="border px-2 py-1 mr-2"
                      value={editedUserName}
                      onChange={(e) => setEditedUserName(e.target.value)}
                    />
                    <div className="space-x-2">
                      <button onClick={() => updateUser(user.id)} className="bg-blue-500 text-white px-2 py-1 rounded">
                        Save
                      </button>
                      <button onClick={() => setEditingUserId(null)} className="text-red-500">
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-medium">{user.name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditedUserName(user.name);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button onClick={() => removeUser(user.id)} className="text-red-600">
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PORTFOLIO SETTINGS */}
      {activeSection === 'portfolio' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Portfolio Settings</h2>
          <p className="mb-4">Manage portfolios below.</p>

          <div className="flex gap-2 mb-4">
            <input
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              placeholder="New portfolio name"
              className="border px-3 py-1 flex-1"
            />
            <button onClick={addNewPortfolio} className="bg-green-500 text-white px-4 py-1 rounded">
              Create Portfolio
            </button>
          </div>

          <ul className="space-y-3">
            {portfolios.map((portfolio) => (
              <li key={portfolio.id} className="border p-3 rounded flex items-center justify-between">
                {editingPortfolioId === portfolio.id ? (
                  <>
                    <input
                      className="border px-2 py-1 mr-2"
                      value={editedPortfolioName}
                      onChange={(e) => setEditedPortfolioName(e.target.value)}
                    />
                    <div className="space-x-2">
                      <button onClick={() => updatePortfolio(portfolio.id)} className="bg-blue-500 text-white px-2 py-1 rounded">
                        Save
                      </button>
                      <button onClick={() => setEditingPortfolioId(null)} className="text-red-500">
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-medium">{portfolio.name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingPortfolioId(portfolio.id);
                          setEditedPortfolioName(portfolio.name);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button onClick={() => removePortfolio(portfolio.id)} className="text-red-600">
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* STOCK SETTINGS */}
      {activeSection === 'stock' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Stock Settings</h2>
          <button type="button" onClick={() => setbuttonForUpdatePrices(prev => !prev)}>
            {buttonForUpdatePrices ? 'Hide Price Update' : 'Update the stock prices'}
          </button>

          <button type="button" onClick={() => setButtonForSetDefaultCurrency(prev => !prev)}>
            {buttonForSetDefaultCurrency ? 'Hide default currency' : 'Set default currency'}
          </button>

          <button type="button" onClick={() => setButtonForSetCurrencyRates(prev => !prev)}>
            {buttonForSetCurrencyRates ? 'Hide currency rates' : 'Set currency rates'}
          </button>

          {buttonForUpdatePrices && (
            <PriceUpdateTable
              title="Edit Stock Prices"
              items={updatedStocks}
              onChange={handlePriceChange}
              onConfirm={updateAllStocksPrice}
            />
          )}

          {buttonForSetDefaultCurrency && (
            <div className="mt-4">
              {currentDefaultCurrency && (
                <p className="text-gray-700 mb-2">
                  Currently default currency is <b>{currentDefaultCurrency}</b>
                </p>
              )}
              <label className="block mb-1 font-medium">Setting default Currency</label>
              <div className="flex gap-2">
                <input
                  value={newDefaultCurrency}
                  onChange={(e) => setNewDefaultCurrency(e.target.value)}
                  placeholder="e.g. USD/EUR"
                  className="border px-3 py-1 flex-1"
                />
                <button
                  onClick={updateSettings}
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          )}


        </div>
      )}
    </div>
  );
};

export { SettingsMenuComponent };