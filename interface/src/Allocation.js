import React, { useState } from 'react';
import API_BASE_URI from './EnvVar.js';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';


const COLORS = ['#3799efff','#1900ffff' , '#00ff62ff', '#FFBB28', '#ff0000ff', '#aa00ff', '#50551fff', '#2f9f40ff' , '#000000', '#ff009dff'];

const Allocation = ({ data, refreshMethods }) => {
  const users = data.users;
  const settings = data.settings;
  const stocks = data.stocks;

  // TODO!!!HERE WE HAVE BUG AND FIX IT
  const enitrePortfolioPrice = (Number(settings[0].allShares) * Number(settings[0].sharePrice)).toFixed(2);
  const today = new Date().toISOString().split("T")[0];

  const [shareState, setShareState] = useState(true);
  const [buttonForStocks, setButtonForStocks] = useState(false);

  // New state for checkbox settings
  const [onlyOneCurrency, setOnlyOneCurrency] = useState(false);
  const [representAsPercentage, setRepresentAsPercentage] = useState(false);

  // New stock form state
  const [addStockMode, setAddStockMode] = useState(false);
  const [buyStockMode, setBuyStockMode] = useState(false);
  const [sellStockMode, setSellStockMode] = useState(false);

  const [newStock, setNewStock] = useState({
    name: '',
    currency: settings[0].defaultCurrency,
    isCash: false,
  });

  const [buyStock, setBuyStock] = useState({
    stockId: '',
    price: '',
    amount: '',
    currency: '',
    rateForTheCurrencty: '',
    date: today,
  });

  // Edit stock state
  const [editingStockId, setEditingStockId] = useState(null);
  const [editValues, setEditValues] = useState({ price: '', shares: '' });

  const chartDataShares = users.filter(u=>u.shares>0).map(u => ({
    name: u.name,
    value: Number(u.shares)
  }));
  chartDataShares.sort((a, b) => b.value - a.value);
  const chartDataUsersMoney = users.filter(u=>u.shares>0).map(u => ({
    name: u.name,
    value: parseFloat((u.shares * settings[0].sharePrice).toFixed(2))
  }));
  chartDataUsersMoney.sort((a, b) => b.value - a.value);

  const currencyExchangeRates = data.rates;

  // Convert function
  function convertCurrency(amount, from, to, rates) {
    if (from === to) return amount;

    for (const r of rates) {
      if (r.firstCurrency === from && r.secondCurrency === to) return amount * r.rate;
      if (r.firstCurrency === to && r.secondCurrency === from) return amount / r.rate;
    }

    console.warn("No conversion path found:", from, to);
    return amount;
  }

  // Build raw stock data first
  const rawStocksData = stocks.map(s => {
    const totalValue = s.price * s.numberOfShares;
    const valueInDefault = convertCurrency(
      totalValue,
      s.currency,
      settings[0].defaultCurrency,
      currencyExchangeRates
    );

    return {
      name: s.name,
      currency: s.currency,
      value: Number(valueInDefault.toFixed(2))
    };
  });

  // Process final output based on checkboxes
  let finalStockData = [...rawStocksData];
  finalStockData.sort((a, b) => b.value - a.value);

  if (onlyOneCurrency) {
    // define which symbols are treated as currencies
    const currencySymbols = 'Cash';

    let cashTotal = 0;
    const nonCash = [];

    for (const item of finalStockData) {
      if (item.name.includes(currencySymbols)) {
        cashTotal += item.value;
      } else {
        nonCash.push(item);
      }
    }

    if (cashTotal > 0) {
      nonCash.push({
        name: "Cash",
        value: Number(Number(cashTotal).toFixed(2))
      });
    }
    finalStockData = nonCash;
    finalStockData.sort((a, b) => b.value - a.value);
  }

  if (representAsPercentage) {
    const total = finalStockData.reduce((sum, s) => sum + s.value, 0);
    finalStockData = finalStockData.map(s => ({
      name: s.name,
      value: Number(((s.value / total) * 100).toFixed(2))
    }));
  }

  // Placeholder actions (API calls go here later)
  async function handleCreateStock() {
    const response = await fetch(`${API_BASE_URI}/createStock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newStock.name,
        currency: newStock.currency,
        isCash: newStock.isCash,
      })
    });
    if(response.status === 200){
      const responseForCalculation = await fetch(`${API_BASE_URI}/getPortfolioSize/${settings[0].defaultCurrency}`);
      if (responseForCalculation.status === 200){
        const result = await responseForCalculation.json();
        const value = result.portfolioValue;
        const newValuePerShare = Number(Number(value)/Number(settings[0].allShares)).toFixed(5);

        await fetch(`${API_BASE_URI}/updateSettings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sharePrice: newValuePerShare })
        });
      }
    }

    setAddStockMode(false);
    setNewStock({ name: '', currency: data.settings[0].defaultCurrency, isCash: false });
    refreshMethods.refreshStocks();
    refreshMethods.refreshSettings();
  }

  async function handleBuyStock(transactionType){
    const response = await fetch(`${API_BASE_URI}/addStockTransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: transactionType,
        stockId: buyStock.stockId,
        price: Number(buyStock.price),
        quantity: Number(buyStock.amount),
        currency: buyStock.currency,
        rate: buyStock.rateForTheCurrencty,
        date: buyStock.date,
      })
    });
    if(response.status === 200){
      const responseForCalculation = await fetch(`${API_BASE_URI}/getPortfolioSize/${settings[0].defaultCurrency}`);
      if (responseForCalculation.status === 200){
        const result = await responseForCalculation.json();
        const value = result.portfolioValue;
        const newValuePerShare = Number(Number(value)/Number(settings[0].allShares)).toFixed(5);

        await fetch(`${API_BASE_URI}/updateSettings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sharePrice: newValuePerShare })
        });
      }
    }
    setBuyStockMode(false);
    setBuyStock({ stockId: '',price: '',amount: '',currency: '',rateForTheCurrencty: '',date: today, });
    refreshMethods.refreshStocks();
    refreshMethods.refreshSettings();
  }
  

  async function handleUpdateStock(id){
    var json = {};
    const stock = stocks.find((s) => s.id === id);
     if (stock.isCash == 1){
      json = {
        id: id,
        shares: editValues.shares
      }
     }
     else{
      json = {
        id: id,
        price: editValues.price,
      }
     }
      
    const response = await fetch(`${API_BASE_URI}/updateStock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json)
    });

    if(response.status === 200){
      const responseForCalculation = await fetch(`${API_BASE_URI}/getPortfolioSize/${settings[0].defaultCurrency}`);
      if (responseForCalculation.status === 200){
        const result = await responseForCalculation.json();
        const value = result.portfolioValue;
        const newValuePerShare = Number(Number(value)/Number(settings[0].allShares)).toFixed(5);
        console.log(newValuePerShare);
        await fetch(`${API_BASE_URI}/updateSettings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sharePrice: newValuePerShare })
        });
      }
    }

    refreshMethods.refreshStocks();
    refreshMethods.refreshSettings();
    setEditingStockId(null);
    setEditValues({ price: '' });
  }

  async function handleDeleteStock(id){
    const response = await fetch(`${API_BASE_URI}/deleteStock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if(response.status === 200){
      const responseForCalculation = await fetch(`${API_BASE_URI}/getPortfolioSize/${settings[0].defaultCurrency}`);
      if (responseForCalculation.status === 200){
        const result = await responseForCalculation.json();
        const value = result.portfolioValue;
        const newValuePerShare = Number(Number(value)/Number(settings[0].allShares)).toFixed(5);

        await fetch(`${API_BASE_URI}/updateSettings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sharePrice: newValuePerShare })
        });
      }
    }

    refreshMethods.refreshStocks();
    refreshMethods.refreshSettings();
  }


 
  return (
    <div>
      {/* {!buttonForStocks && (
        <button className="px-2 py-1 bg-green-500 text-white rounded mr-2" onClick={() => setShareState(!shareState)}>
        {shareState ? "Show money" : "Show shares"}
        </button>
      )} */}
      

      <button className="px-2 py-1 bg-green-500 text-white rounded mr-2" onClick={() => setButtonForStocks(!buttonForStocks)}>
        {buttonForStocks ? "Show piechart" : "Show stocks"}
      </button>

      {!buttonForStocks && (
        
        <div>
          <h1 className="mt-3">
            {"Money distribution "}
          </h1>
          <PieChart width={400} height={400}>
            <Pie
              data={chartDataUsersMoney}
              label
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {(chartDataUsersMoney).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>

          <h1 className="mt-3">
            {"Entire shares: " + Number(settings[0].allShares).toFixed(0)}
          </h1>
            <h1 className="mt-3">
            {"Share price: " + Number(settings[0].sharePrice) + " "+ settings[0].defaultCurrency}
          </h1>
          <h1 className="mt-3">
            {"Entire value of portfolio: " + enitrePortfolioPrice + " "+ settings[0].defaultCurrency}
          </h1>

           <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Shares</th>
                <th>Amount money</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} >
                  <td >{u.name}</td>
                  <td>{Number(u.shares).toFixed(0)}</td>
                  <td>{(Number(u.shares).toFixed(0) * Number(settings[0].sharePrice)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
     
       
      
      {buttonForStocks && (
        <div className="mt-4">

          {/* CHECKBOXES */}
          <div className="mt-2 space-x-4">
            <label>
              <input type="checkbox" checked={onlyOneCurrency} onChange={() => setOnlyOneCurrency(!onlyOneCurrency)} />
              <span className="ml-1">Only one Currency</span>
            </label>

            <label>
              <input type="checkbox" checked={representAsPercentage} onChange={() => setRepresentAsPercentage(!representAsPercentage)} />
              <span className="ml-1">Represent by %</span>
            </label>
          </div>

          <PieChart width={400} height={400}>
            <Pie
              data={finalStockData}
              label
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {finalStockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => representAsPercentage ? `${value}%` : value} />
            <Legend />
          </PieChart>

          <h1 className="mt-3">
            Entire value of portfolio: {enitrePortfolioPrice}
          </h1>

          {!addStockMode && !buyStockMode && !sellStockMode && (
            <>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => setAddStockMode(true)}>
              Add New Stock
            </button>

            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => setBuyStockMode(true)}>
              Buy stock
            </button>

            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => setSellStockMode(true)}>
              Sell Stock
            </button>
            </>
            
          )}
          {/* BUY STOCK */}
          {buyStockMode && (
            <>
            <div className="p-3 border rounded mt-3 space-y-2 max-w-md">
              <h3 className="font-semibold">Buying stock</h3>

              <select
                className="w-full p-2 border rounded"
                value={buyStock.stockId}
                onChange={(e) =>{
                const selectedStockId = e.target.value;
               
                const selectedStock = stocks.find(
                  (s) => s.id == selectedStockId
                );
  
                setBuyStock({
                  ...buyStock,
                  stockId: selectedStockId,
                  currency: selectedStock.currency,
                  rateForTheCurrencty: selectedStock.currency == data.settings[0].defaultCurrency?1:""
                });
                }}
              >
                <option value="">Select stock</option>

                {stocks.filter(u=>u.isCash===0).map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.name} ({stock.id})
                  </option>
                ))}
              </select>
              
              <input type="number" placeholder="Number of Shares" className="w-full p-2 border rounded"
                value={buyStock.shares} onChange={(e) => setBuyStock({ ...buyStock, amount: e.target.value })} />

              <input type="number" placeholder="Price per Share" className="w-full p-2 border rounded"
                value={buyStock.price} onChange={(e) => setBuyStock({ ...buyStock, price: e.target.value })} />

              <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-100"
                  value={buyStock.currency}
                  disabled
                />

              <input
                type="number"
                placeholder="Currency Rate"
                className="w-full p-2 border rounded"
                value={buyStock.rateForTheCurrencty}
                disabled={buyStock.currency === data.settings[0].defaultCurrency}
                onChange={(e) =>
                  setBuyStock({
                    ...buyStock,
                    rateForTheCurrencty: e.target.value
                  })
                }
              />
              
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={buyStock.date}
                onChange={(e) =>
                  setBuyStock({ ...buyStock, date: e.target.value })
                }
              />
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => handleBuyStock("buy")}>Upload</button>
                <button className="px-3 py-2 bg-gray-400 text-white rounded" onClick={() => setBuyStockMode(false)}>Cancel</button>
              </div>
            </div>
            </>
            
          )}
          {/* SELL STOCK */}
          {sellStockMode && (
            <>
            <div className="p-3 border rounded mt-3 space-y-2 max-w-md">
              <h3 className="font-semibold">Buying stock</h3>

              <select
                className="w-full p-2 border rounded"
                value={buyStock.stockId}
                onChange={(e) =>{
                const selectedStockId = e.target.value;
               
                const selectedStock = stocks.find(
                  (s) => s.id == selectedStockId
                );
  
                setBuyStock({
                  ...buyStock,
                  stockId: selectedStockId,
                  currency: selectedStock.currency,
                  rateForTheCurrencty: selectedStock.currency == data.settings[0].defaultCurrency?1:""
                });
                }}
              >
                <option value="">Select stock</option>

                {stocks.filter(u=>u.isCash===0).map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.name} ({stock.id})
                  </option>
                ))}
              </select>
              
              <input type="number" placeholder="Number of Shares" className="w-full p-2 border rounded"
                value={buyStock.shares} onChange={(e) => setBuyStock({ ...buyStock, amount: e.target.value })} />

              <input type="number" placeholder="Price per Share" className="w-full p-2 border rounded"
                value={buyStock.price} onChange={(e) => setBuyStock({ ...buyStock, price: e.target.value })} />

              <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-100"
                  value={buyStock.currency}
                  readOnly
                />

              <input type="text" placeholder="Currency Rate" className="w-full p-2 border rounded"
                value={buyStock.rateForTheCurrencty} onChange={(e) => setBuyStock({ ...buyStock, rateForTheCurrencty: e.target.value })} />
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={buyStock.date}
                onChange={(e) =>
                  setBuyStock({ ...buyStock, date: e.target.value })
                }
              />
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => handleBuyStock("sell")}>Upload</button>
                <button className="px-3 py-2 bg-gray-400 text-white rounded" onClick={() => setSellStockMode(false)}>Cancel</button>
              </div>
            </div>
            </>
            
          )}



          {addStockMode && (
            <div className="p-3 border rounded mt-3 space-y-2 max-w-md">
              <h3 className="font-semibold">Add New Stock</h3>

              <input type="text" placeholder="Stock Name" className="w-full p-2 border rounded"
                value={newStock.name} onChange={(e) => setNewStock({ ...newStock, name: e.target.value })} />

              <input type="text" placeholder="Currency" className="w-full p-2 border rounded"
                value={newStock.currency} onChange={(e) => setNewStock({ ...newStock, currency: e.target.value })} />
              <input type="checkbox" id="isCash" name="isCash" value={newStock.isCash} onChange={(e) => setNewStock({ ...newStock, isCash: e.target.checked })}
              />
              <label for="isCash">Is Cash</label>
              
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={handleCreateStock}>Upload</button>
                <button className="px-3 py-2 bg-gray-400 text-white rounded" onClick={() => setAddStockMode(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div className="bg-red-500 text-white p-4">
</div>
          <table className="min-w-full border border-gray-300 bg-white mt-4 rounded">
          <thead class="bg-gray-200">
            <tr>
              <th className="px-3 py-2 text-blue-600">Name</th>
              <th className="px-3 py-2">Shares</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Currency</th>
              <th className="px-3 py-2">Average Price</th>
              <th className="px-3 py-2">Profit</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.id} className="border-t">
                
                {/* NAME */}
                <td className="px-3 py-2">{stock.name}</td>

                {/* SHARES */}
                <td className="px-3 py-2">
                  {editingStockId === stock.id ? (
                    stock.isCash == 1 ? (
                      <input
                        type="number"
                        className="w-20 p-1 border rounded"
                        value={editValues.shares}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            shares: e.target.value,
                          })
                        }
                      />
                    ) : (
                      stock.numberOfShares
                    )
                  ) : (
                    stock.numberOfShares
                  )}
                </td>

                {/* PRICE */}
                <td className="px-3 py-2">
                  {editingStockId === stock.id ? (
                    stock.isCash != 1 ? (
                      <input
                        type="number"
                        className="w-20 p-1 border rounded"
                        value={editValues.price}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            price: e.target.value,
                          })
                        }
                      />
                    ) : (
                      Number(stock.price).toFixed(3)
                    )
                  ) : (
                    Number(stock.price).toFixed(3)
                  )}
                </td>

                {/* CURRENCY */}
                <td className="px-3 py-2">{stock.currency}</td>
                  {/* AVERAGE PRICE */}
                <td className="px-3 py-2">
                  {stock.averagePrice ? Number(stock.averagePrice).toFixed(2) : "-"}
                </td>
                {/* PROFIT */}
                  <td
                className={`px-3 py-2 ${
                  stock.averagePrice > 0 &&
                  ((stock.price - stock.averagePrice) / stock.averagePrice) > 0
                    ? "text-green-600"
                    : stock.averagePrice > 0 &&
                      ((stock.price - stock.averagePrice) / stock.averagePrice) < 0
                    ? "text-red-600"
                    : ""
                }`}
              >
                {stock.averagePrice > 0
                  ? (
                      ((stock.price - stock.averagePrice) / stock.averagePrice) *
                      100
                    ).toFixed(2) + "%"
                  : "-"}
              </td>
                {/* ACTIONS */}
                <td className="px-3 py-2 text-center space-x-2">
                  {editingStockId === stock.id ? (
                    <>
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded"
                        onClick={() => handleUpdateStock(stock.id)}
                      >
                        Save
                      </button>

                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded"
                        onClick={() => setEditingStockId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                        onClick={() => {
                          setEditingStockId(stock.id);
                          setEditValues({
                            price: stock.price,
                            shares: stock.numberOfShare,
                          });
                        }}
                      >
                        {stock.isCash == 1
                          ? "Update amount of money"
                          : "Update share price"}
                      </button>

                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded"
                        onClick={() => handleDeleteStock(stock.id)}
                      >
                        Delete
                      </button>
                    </>
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
