import React, { useState, useEffect } from 'react';
import PortfolioChart from './PortfolioChart';
import PortfolioList from './PortfolioList';
import API_BASE_URI from './EnvVar.js';

const HomeComponent = () => {
  const [porfoliosNamesAndId, setPorfoliosNamesAndId] = useState({});
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [allStocksInfo, setAllStocksInfo] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [newStock, setNewStock] = useState({
    name: '',
    symbol: '',
    currency: '',
    price: '',
    quantity: ''
  });
  const [showUpdatePrices, setShowUpdatePrices] = useState(false);
  const [updatedStocks, setUpdatedStocks] = useState([]);
  const [deletedStock, setDeletedStock] = useState(false);


  useEffect(() => {
    getAllPortfolios();
    getAllStocks();

  }, []);

  useEffect(() => {
    if (allStocksInfo.length > 0) {
      setUpdatedStocks([...allStocksInfo]);
      getAllValueOfPortfolio(null);
    }
  }, [allStocksInfo]);

  useEffect(() => {
    if (deletedStock) {
      getAllValueOfPortfolio(selectedPortfolio);
      setDeletedStock(false);
    }
  }, [deletedStock]);

  async function getAllPortfolios() {
    const response = await fetch(`${API_BASE_URI}/getAllPortfolios`);
    if (response.status !== 200) {
      alert("Problem trying to get all Portfolios");
    } else {
      const data = await response.json();
      setPorfoliosNamesAndId(data.reduce((map, item) => {
        map[item.id] = item.name;
        return map;
      }, {}));
    }
  }

  async function getAllStocks() {
    const response = await fetch(`${API_BASE_URI}/getAllStocks`);
    if (response.status !== 200) {
      alert("Problem trying to get all Stocks");
    } else {
      const data = await response.json();
      const stocks = data.map(stock => ({
        id: stock.id,
        name: stock.name,
        symbol: stock.symbol,
        currency: stock.currency,
        price: parseFloat(stock.price)
      }));
      setAllStocksInfo(stocks);
    }
  }

  const handleChange = (event) => {
    const selected = event.target.value;
    setSelectedPortfolio(selected);
    getAllValueOfPortfolio(selected);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStock(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (id, newPrice) => {
    setUpdatedStocks(prev =>
      prev.map(stock =>
        stock.id === id ? { ...stock, price: newPrice } : stock
      )
    );
  };

  async function updateAllStocksPrice() {
    try {
      for (const stock of updatedStocks) {
        const response = await fetch(`${API_BASE_URI}/updateStock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: stock.id, price: parseFloat(stock.price) })
        });

        if (!response.ok) {
          throw new Error(`Failed to update stock ${stock.symbol}`);
        }
      }
      getAllStocks();
    } catch (error) {
      console.error("Update error:", error);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const response = await fetch(`${API_BASE_URI}/addNewStockToPortfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newStock.name,
        symbol: newStock.symbol,
        currency: newStock.currency,
        price: newStock.price,
        quantity: newStock.quantity,
        portfolioId: selectedPortfolio
      })
    });
    if (response.status !== 200) {
      alert("Problem trying to add a new Stock to portfolio");
    }
    setNewStock({ name: '', symbol: '', currency: '', price: '', quantity: '' });
    setShowAddStockForm(false);
    getAllStocks();
  }

  // когато добавяш нова акция се чупи!
  async function getAllValueOfPortfolio(portfolioId) {
    const url = portfolioId == null
      ? `${API_BASE_URI}/getAllStockToPortfolio/`
      : `${API_BASE_URI}/getAllStockToPortfolio/${portfolioId}`;

    const response = await fetch(url);
    if (response.status !== 200) {
      alert("Problem trying to get Portfolio stocks");
    } else {
      const result = await response.json();

      const mapped = result.map(item => {
        const stock = allStocksInfo.find(s => s.id === item.idStock);
        return {
          symbol: stock.symbol,
          name: stock.name,
          numShares: item.numStocks,
          value: parseFloat(item.valueOfStock),
          currentPrice: stock.price,
          averagePricePerStock: parseFloat(item.price).toFixed(2),
          currentMarketCap: parseFloat((stock.price * item.numStocks).toFixed(2)),
          returnOfInvestment: parseFloat((((stock.price * item.numStocks) - item.valueOfStock) / item.valueOfStock) * 100).toFixed(2),
          percentage: 0,
          idOfDB: item.id,
        };
      });

      setStockData(mapped);
    }
  }

  return (
    <div>
      <select onChange={handleChange}>
        <option key="0" value="">Entire portfolio</option>
        {Object.entries(porfoliosNamesAndId).map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>

      <button type="button" onClick={() => setShowUpdatePrices(prev => !prev)}>
        {showUpdatePrices ? 'Hide Price Update' : 'Update the stock prices'}
      </button>

      {selectedPortfolio !== '' && (
        <div>
          <button type="button" onClick={() => setShowAddStockForm(true)}>
            Buy a stock
          </button>

          <button type="button" onClick={() => setShowAddStockForm(true)}>
            Sell a stock
          </button>
          {/*
            <button type="button" onClick={() => setShowAddStockForm(true)}>
              Update the :????
            </button> */}
        </div>

      )}

      {showAddStockForm && (
        <form onSubmit={handleFormSubmit} style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <div>
            <label>Name of Stock:
              <input type="text" name="name" value={newStock.name} onChange={handleInputChange} required />
            </label>
          </div>
          <div>
            <label>Symbol:
              <input type="text" name="symbol" value={newStock.symbol} onChange={handleInputChange} required />
            </label>
          </div>
          <div>
            <label>Currency:
              <input type="text" name="currency" value={newStock.currency} onChange={handleInputChange} required />
            </label>
          </div>
          <div>
            <label>Stock Price:
              <input type="number" step="0.01" name="price" value={newStock.price} onChange={handleInputChange} required />
            </label>
          </div>
          <div>
            <label>Number of Stocks:
              <input type="number" name="quantity" value={newStock.quantity} onChange={handleInputChange} required />
            </label>
          </div>

          <button type="submit">Submit</button>
        </form>
      )}

      {showUpdatePrices && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Edit Stock Prices</h3>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Currency</th>
                <th>New Price</th>
              </tr>
            </thead>
            <tbody>
              {updatedStocks.map(stock => (
                <tr key={stock.id}>
                  <td>{stock.symbol}</td>
                  <td>{stock.name}</td>
                  <td>{stock.currency}</td>
                  <td>
                    <input
                      type="number"
                      value={stock.price}
                      step="0.01"
                      onChange={(e) => handlePriceChange(stock.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={updateAllStocksPrice} style={{ marginTop: '10px' }}>
            Confirm Update
          </button>
        </div>
      )}

      <h2 className="text-3xl font-semibold mb-6">Portfolio Overview</h2>
      <PortfolioChart data={stockData} />
      <h3 className="text-xl font-medium mt-8 mb-2">Stock Breakdown</h3>
      <PortfolioList stocks={stockData} setDelete={setDeletedStock} />
    </div>
  );
};

export { HomeComponent };

/*
  TODO: Add date on adding a new stock
  Add an sell stock method
  Add an edit stock method

*/