import React, { useState, useEffect } from 'react';
import PortfolioChart from './PortfolioChart';
import PortfolioList from './PortfolioList';
import API_BASE_URI from './EnvVar.js';
import FormInput from './FormInput.js';
import PriceUpdateTable from './PriceUpdateTable.js';

const HomeComponent = () => {
  const [porfoliosNamesAndId, setPorfoliosNamesAndId] = useState({});
  const [selectedPortfolio, setSelectedPortfolio] = useState('');

  const [showBuyStockForm, setShowBuyStockForm] = useState(false);
  const [showSellStockForm, setShowSellStockForm] = useState(false);

  const [allStocksInfo, setAllStocksInfo] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [newStock, setNewStock] = useState({
    name: '',
    symbol: '',
    currency: '',
    price: '',
    quantity: '',
    transactionDate: '',
    isStock: false
  });
  const [showUpdatePrices, setShowUpdatePrices] = useState(false);
  const [updatedStocks, setUpdatedStocks] = useState([]);
  const [deletedStock, setDeletedStock] = useState(false);
  const [entireCashValue, setEntireCashValue] = useState(1);


  useEffect(() => {
    getAllPortfolios();
    getAllStocks();

  }, []);

  useEffect(() => {
    if (allStocksInfo.length > 0) {
      setUpdatedStocks([...allStocksInfo]);
      getAllValueOfPortfolio(selectedPortfolio);
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
      const stocks = data
        .map(stock => ({
          id: stock.id,
          name: stock.name,
          symbol: stock.symbol,
          currency: stock.currency,
          price: parseFloat(stock.price),
          isCash: stock.isCash
        }));
      setAllStocksInfo(stocks);
    }
  }

  const handleChange = (event) => {
    const selected = event.target.value;
    setSelectedPortfolio(selected);
    // setEntireCashValue(0);
    selected == "" ? getAllValueOfPortfolio(null) : getAllValueOfPortfolio(selected);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStock(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

  async function handleBuySubmit(e) {
    e.preventDefault();

    const url = newStock.isStock == true
      ? `${API_BASE_URI}/buyStockInPortfolio`
      : `${API_BASE_URI}/updateCashAmount`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newStock.name,
        symbol: newStock.symbol,
        currency: newStock.currency,
        price: newStock.price,
        quantity: newStock.quantity,
        portfolioId: selectedPortfolio,
        date: newStock.transactionDate,
        isStock: newStock.isStock
      })
    });
    if (response.status !== 200) {
      alert("Problem trying to add a new Stock to portfolio");
    }
    setNewStock({ name: '', symbol: '', currency: '', price: '', quantity: '', isStock: false });
    setShowBuyStockForm(false);
    getAllStocks();
  }

  async function handleSellSubmit(e) {
    e.preventDefault();
    const response = await fetch(`${API_BASE_URI}/sellStockInPortfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newStock.name,
        symbol: newStock.symbol,
        currency: newStock.currency,
        price: newStock.price,
        quantity: newStock.quantity,
        portfolioId: selectedPortfolio,
        date: newStock.transactionDate,
        isStock: newStock.isStock
      })
    });
    if (response.status !== 200) {
      alert("Problem trying to add a new Stock to portfolio");
    }
    setNewStock({ name: '', symbol: '', currency: '', price: '', quantity: '', isStock: false });
    setShowSellStockForm(false);
    getAllStocks();
  }

  async function getAllValueOfPortfolio(portfolioId) {
    const url = portfolioId == null
      ? `${API_BASE_URI}/getAllStockToPortfolio/`
      : `${API_BASE_URI}/getAllStockToPortfolio/${portfolioId}`;

    const response = await fetch(url);
    if (response.status !== 200) {
      alert("Problem trying to get Portfolio stocks");
    } else {
      const result = await response.json();

      // Filter out 0-stock entries
      const filtered = result.filter(item => parseFloat(item.numStocks) !== 0);
      let combined = [];
      if (portfolioId == null) {
        // Group by idStock and combine quantities and values
        const grouped = {};

        for (const item of filtered) {
          const id = item.idStock;
          // if id is find for first time
          if (!grouped[id]) {
            grouped[id] = {
              ...item,
              numStocks: parseFloat(item.numStocks),
              valueOfStock: parseFloat(item.valueOfStock)
            };
          }
          // if we already have added the id => EXample i have USD in one account and now it is found in another one.
          else {
            grouped[id].numStocks += parseFloat(item.numStocks);
            grouped[id].valueOfStock += parseFloat(item.valueOfStock);
          }
        }

        combined = Object.values(grouped);
      } else {
        combined = filtered;
      }
      let entireCashValue = 0;
      setEntireCashValue(0);
      // Final mapping to UI format
      const mapped = combined.map(item => {
        const stock = allStocksInfo.find(s => s.id === item.idStock);
        if (!stock) return null;

        const numStocks = parseFloat(item.numStocks);
        const valueOfStock = parseFloat(item.valueOfStock);
        entireCashValue = entireCashValue + (parseFloat((stock.price * numStocks).toFixed(2)));
        setEntireCashValue(entireCashValue);
        return {
          symbol: stock.symbol,
          name: stock.name,
          numShares: numStocks,
          value: valueOfStock,
          currentPrice: stock.price,
          averagePricePerStock: (valueOfStock / numStocks).toFixed(2),
          currentMarketCap: parseFloat((stock.price * numStocks).toFixed(2)),
          returnOfInvestment: ((stock.price * numStocks - valueOfStock) / valueOfStock * 100).toFixed(2),
          percentage: 0,
          idOfDB: item.id // optional for updates/deletes
        };
      }).filter(Boolean); // remove nulls

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
          <button type="button" onClick={() => setShowBuyStockForm(prev => !prev)}>
            {showBuyStockForm ? 'Hide Buy Stock/Insert Cash' : 'Buy Stock/Insert Cash'}
          </button>

          <button type="button" onClick={() => setShowSellStockForm(prev => !prev)}>
            {showSellStockForm ? 'Hide Sell Stock/Remove Cash' : 'Sell Stock/Remove Cash'}
          </button>
        </div>

      )}

      {/* Buying stock */}
      {showBuyStockForm && (
        <FormInput
          title="Buy Stock/Insert Cash"
          stock={newStock}
          onChange={handleInputChange}
          onSubmit={handleBuySubmit}
        />
      )}

      {/* Selling a stock */}
      {
        showSellStockForm && (
          <FormInput
            title="Sell Stock/Remove Cash"
            stock={newStock}
            onChange={handleInputChange}
            onSubmit={handleSellSubmit}
          />
        )
      }

      {showUpdatePrices && (
        <PriceUpdateTable
          title="Edit Stock Prices"
          items={updatedStocks}
          onChange={handlePriceChange}
          onConfirm={updateAllStocksPrice}
        />
      )}


      <h2 className="text-3xl font-semibold mb-6">Portfolio Overview</h2>

      <PortfolioChart data={stockData} />
      <h3 className="text-xl font-medium mt-8 mb-2">Stock Breakdown</h3>
      <h3>Current value: {entireCashValue}</h3>
      <PortfolioList stocks={stockData} setDelete={setDeletedStock} />
    </div >
  );
};

export { HomeComponent };

/*
  TODO: 
  Add sell stock OK
  Add date on adding a new stock OK
  Add insert/remove money OK
  проблем когато се добави същата валута в друг акаунт - изкачат два пъти примерно USD! OK
  fix the db, by removing in Portfolio => Currency and valueOfPortfolio OK
  add Currency in display
  add in Portfolio menu the entire portfolio price + currency exchange.
  Add transaction history + delete some of the history

*/