import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#3799efff','#1900ffff' , '#00ff62ff', '#FFBB28', '#ff0000ff', '#aa00ff', '#50551fff', '#2f9f40ff' , '#000000', '#ff009dff'];

const Allocation = ({ data,refreshMethods }) => {
  const users = data.users;
  const settings = data.settings;
  const stocks = data.stocks;

  const enitrePortfolioPrice = (Number(settings[0].allShares) * Number(settings[0].sharePrice)).toFixed(2);

  const [shareState, setShareState] = useState(true);
  const [buttonForStocks, setButtonForStocks] = useState(false);

  // New stock form state
  const [addStockMode, setAddStockMode] = useState(false);
  const [newStock, setNewStock] = useState({
    name: '',
    shares: '',
    price: '',
    currency: ''
  });

  // Edit stock state
  const [editingStockId, setEditingStockId] = useState(null);
  const [editValues, setEditValues] = useState({ shares: '', price: '' });

  const chartDataShares = users.map(u => ({
    name: u.name,
    value: Number(u.shares)
  }));

  const chartDataUsersMoney = users.map(u => ({
    name: u.name,
    value: parseFloat((u.shares * settings[0].sharePrice).toFixed(2))
  }));

  // Placeholder actions (API calls go here later)
  async function handleCreateStock() {
    const response = await fetch(`${API_BASE_URI}/createStock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              name: newStock.name,
              price: newStock.price,
              shares: newStock.shares,
              currency: newStock.currency
          })
      });
    if(response.status==200){
      // we need to get portfolio value /calculatePortfolioValue/{currency}
      const responseForCalculation = await fetch(`${API_BASE_URI}/calculatePortfolioValue/${settings[0].defaultCurrency}`, {
        });
        if (responseForCalculation.status==200){
            const result = await responseForCalculation.json();
            const value = result.portfolioValue;

            const newValuePerShare = Number(Number(value)/Number(settings[0].allShares)).toFixed(5);
            const responseUpdateSettings = await fetch(`${API_BASE_URI}/updateSettings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  sharePrice: newValuePerShare
              })
          });
        }
      
    }
    setAddStockMode(false);
    setNewStock({ name: '', shares: '', price: '', currency: 'USD' });
    refreshMethods.refreshStocks();
    refreshMethods.refreshSettings();
    
  };

  async function handleUpdateStock(id){
    
    const response = await fetch(`${API_BASE_URI}/updateStock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              id: id,
              price:editValues.price,
              shares:editValues.shares
          })
      });
    // again we need to call this
    if(response.status==200){
      const responseForCalculation = await fetch(`${API_BASE_URI}/calculatePortfolioValue/${settings[0].defaultCurrency}`, {
        });
        if (responseForCalculation.status==200){
            const result = await responseForCalculation.json();
            const value = result.portfolioValue;

            const newValuePerShare = Number(Number(value)/Number(settings[0].allShares)).toFixed(5);
            
            const responseUpdateSettings = await fetch(`${API_BASE_URI}/updateSettings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  sharePrice: newValuePerShare
              })
          });
        }
      
    }
    refreshMethods.refreshStocks();
    refreshMethods.refreshSettings();
    setEditingStockId(null);
    setEditValues({ shares: '', price: '' });
  };

  async function handleDeleteStock(id){
    const response = await fetch(`${API_BASE_URI}/deleteStock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              id: id
          })
      });
    // again we need to call this
    if(response.status==200){
      const responseForCalculation = await fetch(`${API_BASE_URI}/calculatePortfolioValue/${settings[0].defaultCurrency}`, {
        });
        if (responseForCalculation.status==200){
            const result = await responseForCalculation.json();
            const value = result.portfolioValue;

            const newValuePerShare = Number(Number(value)/Number(settings[0].allShares)).toFixed(5);
            const responseUpdateSettings = await fetch(`${API_BASE_URI}/updateSettings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  sharePrice: newValuePerShare
              })
          });
        }
    }
    refreshMethods.refreshStocks();
    refreshMethods.refreshSettings();
  };

  return (
    <div>

      {/* TOGGLE BUTTON 1 */}
      <button
        className="px-2 py-1 bg-green-500 text-white rounded mr-2"
        onClick={() => setShareState(!shareState)}
      >
        {shareState ? "Show money" : "Show shares"}
      </button>

      {/* TOGGLE BUTTON 2 */}
      <button
        className="px-2 py-1 bg-green-500 text-white rounded mr-2"
        onClick={() => setButtonForStocks(!buttonForStocks)}
      >
        {buttonForStocks ? "Show piechart" : "Show stocks"}
      </button>


      {/* PIE CHART SECTION */}
      {!buttonForStocks && (
        <div>
          <PieChart width={400} height={400}>
            <Pie
              data={shareState ? chartDataShares : chartDataUsersMoney}
              label
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartDataShares.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>

          <h1 className="mt-3">
            {shareState
              ? "Entire shares: " + Number(settings[0].allShares).toFixed(2)
              : "Entire value of portfolio: " + enitrePortfolioPrice}
          </h1>
        </div>
      )}

      {/* STOCKS SECTION */}
      {buttonForStocks && (
        <div className="mt-4">

          {/* ADD NEW STOCK BUTTON */}
          {!addStockMode && (
            <button
              className="px-3 py-2 bg-blue-600 text-white rounded"
              onClick={() => setAddStockMode(true)}
            >
              Add New Stock
            </button>
          )}

          {/* ADD NEW STOCK FORM */}
          {addStockMode && (
            <div className="p-3 border rounded mt-3 space-y-2 max-w-md">
              <h3 className="font-semibold">Add New Stock</h3>

              <input
                type="text"
                placeholder="Stock Name"
                className="w-full p-2 border rounded"
                value={newStock.name}
                onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
              />

              <input
                type="number"
                placeholder="Number of Shares"
                className="w-full p-2 border rounded"
                value={newStock.shares}
                onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
              />

              <input
                type="number"
                placeholder="Price per Share"
                className="w-full p-2 border rounded"
                value={newStock.price}
                onChange={(e) => setNewStock({ ...newStock, price: e.target.value })}
              />

              <input
                type="text"
                placeholder="Currency"
                className="w-full p-2 border rounded"
                value={newStock.currency}
                onChange={(e) => setNewStock({ ...newStock, currency: e.target.value })}
              />

              <div className="flex gap-2">
                <button
                  className="px-3 py-2 bg-green-600 text-white rounded"
                  onClick={handleCreateStock}
                >
                  Upload
                </button>

                <button
                  className="px-3 py-2 bg-gray-400 text-white rounded"
                  onClick={() => setAddStockMode(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STOCKS TABLE */}
          <table className="min-w-full border border-gray-300 bg-white mt-4 rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Shares</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Currency</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {stocks.map(stock => (
                <tr key={stock.id} className="border-t">
                  <td className="px-3 py-2">{stock.name}</td>

                  <td className="px-3 py-2">
                    {editingStockId === stock.id ? (
                      <input
                        type="number"
                        className="w-20 p-1 border rounded"
                        value={editValues.shares}
                        onChange={(e) => setEditValues({ ...editValues, shares: e.target.value })}
                      />
                    ) : (
                      stock.numberOfShares
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {editingStockId === stock.id ? (
                      <input
                        type="number"
                        className="w-20 p-1 border rounded"
                        value={editValues.price}
                        onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                      />
                    ) : (
                      stock.price
                    )}
                  </td>

                  <td className="px-3 py-2">{stock.currency}</td>

                  <td className="px-3 py-2 text-center space-x-2">
                    {editingStockId === stock.id ? (
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded"
                        onClick={() => handleUpdateStock(stock.id)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                        onClick={() => {
                          setEditingStockId(stock.id);
                          setEditValues({ shares: stock.numberOfShares, price: stock.price });
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {editingStockId === stock.id ? (
                       <button
                      className="px-2 py-1 bg-red-600 text-white rounded"
                      onClick={() => setEditingStockId(null)}
                    >
                      Cancel
                    </button>
                    ): (
                       <button
                      className="px-2 py-1 bg-red-600 text-white rounded"
                      onClick={() => handleDeleteStock(stock.id)}
                    >
                      Delete
                    </button>
                    )}
                   
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
};

export { Allocation };
