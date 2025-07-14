import React, { useState, useEffect } from 'react';
import PortfolioChart from './PortfolioChart';
import PortfolioList from './PortfolioList';
import API_BASE_URI from './EnvVar.js';
import FormInput from './FormInput.js';
import PriceUpdateTable from './PriceUpdateTable.js';
import StockDistributionView from './StockDistributionView.js'

const HomeComponent = ({ data }) => {



  const [porfoliosNamesAndId, setPorfoliosNamesAndId] = useState({});
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [allUsers, setAllUsers] = useState({});

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
  const [updatedStocks, setUpdatedStocks] = useState([]);
  const [deletedStock, setDeletedStock] = useState(false);
  const [entireCashValue, setEntireCashValue] = useState(1);


  const [selectedStockId, setSelectedStockId] = useState(null);


  useEffect(() => {
    getAllPortfolios();
    getAllStocks();
    getAllUsers();

    setLoadedData();
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

  function setLoadedData() {
    // console.log(data.stocks);

    // setPorfoliosNamesAndId(data.portfolios.reduce((map, item) => {
    //   map[item.id] = item.name;
    //   return map;
    // }, {}));

  }


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
      console.log(data);
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
      console.log(stocks);
    }
  }

  async function getAllUsers() {
    const response = await fetch(`${API_BASE_URI}/getAllUsers`, {
      method: 'GET'
    });
    if (response.status !== 200) {
      alert("Problem trying to get all Stocks");
    } else {
      const data = await response.json();
      setAllUsers(data.reduce((map, item) => {
        map[item.id] = item.name;
        return map;
      }, {}));
    }
  }
  const handleChange = (event) => {
    const selected = event.target.value;
    setSelectedPortfolio(selected);
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




  async function handleBuySubmit(e) {
    e.preventDefault();

    const url = newStock.isStock == true
      ? `${API_BASE_URI}/buyStockInPortfolio`
      : `${API_BASE_URI}/addCashInPortfolio`;
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
        isStock: newStock.isStock,
        allocations: newStock.allocations
      })
    });
    if (response.status !== 200) {
      alert("Problem trying to add a new Stock to portfolio");
    }
    setNewStock({ name: '', symbol: '', currency: '', price: '', quantity: '', isStock: false, allocation: '' });
    setShowBuyStockForm(false);
    getAllStocks();
  }

  async function handleSellSubmit(e) {
    e.preventDefault();
    const url = newStock.isStock == true
      ? `${API_BASE_URI}/sellStockInPortfolio`
      : `${API_BASE_URI}/removeCashFromPortfolio`;
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
        isStock: newStock.isStock,
        allocations: newStock.allocations
      })
    });
    if (response.status !== 200) {
      alert("Problem trying to add a new Stock to portfolio");
    }
    setNewStock({ name: '', symbol: '', currency: '', price: '', quantity: '', isStock: false, allocation: '' });
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
          stockId: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          stockCurrency: stock.currency,
          numShares: numStocks,
          value: valueOfStock,
          currentPrice: stock.price,
          averagePricePerStock: (valueOfStock / numStocks).toFixed(2),
          currentMarketCap: parseFloat((stock.price * numStocks).toFixed(2)),
          returnOfInvestment: ((stock.price * numStocks - valueOfStock) / valueOfStock * 100).toFixed(2),
          percentage: 0,
          idOfDB: item.id
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
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowBuyStockForm(false)}>×</button>
            <FormInput
              title="Buy Stock/Insert Cash"
              stock={newStock}
              listOfStocks={allStocksInfo}
              onChange={handleInputChange}
              onSubmit={handleBuySubmit}
              portfolioId={selectedPortfolio}
              listOfUsers={allUsers}
            />
          </div>
        </div>
      )}

      {/* Selling a stock */}
      {
        showSellStockForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setShowSellStockForm(false)}>×</button>
              <FormInput
                title="Sell Stock/Remove Cash"
                stock={newStock}
                listOfStocks={allStocksInfo}
                onChange={handleInputChange}
                onSubmit={handleSellSubmit}
                portfolioId={selectedPortfolio}
                listOfUsers={allUsers}
              />
            </div>
          </div>
        )
      }

      {selectedStockId ? (
        <StockDistributionView
          stock={stockData.find(s => s.stockId === selectedStockId)}
          goBack={() => setSelectedStockId(null)}
        />
      ) : (
        <>
          <h2 className="text-3xl font-semibold mb-6">
            Portfolio Overview: {porfoliosNamesAndId[selectedPortfolio]}
          </h2>
          <PortfolioChart data={stockData} dataKey={"currentMarketCap"} />
          <h3 className="text-xl font-medium mt-8 mb-2">Stock Breakdown</h3>
          <h3>Current value: {entireCashValue}</h3>
          <PortfolioList
            stocks={stockData}
            setDelete={setDeletedStock}
            onStockClick={(stockId) => setSelectedStockId(stockId)}
          />
        </>
      )}
    </div >
  );
};

export { HomeComponent };
/*
  TASKS TO DO:
    TOP PRIORITY!
    добавяне на възможност за добавяне на дивиденти, fees от currency exchange, fees от купуване, продаване и други.
    Individual Profile of user (How much profit he has) -> друга база ще ни трябва
    Calculate individual taxes to the goverment.
    Stock split implementation.

    MID!
    Оправяне на менютата
    Optimization of time and memory of the code!
    Fix if it is selling not to show fields of equal split and portfolio value split
  
    LOW!
    документиране на кода
    Transaction history!
    Show all money that the portfolio have available in the form, so to know how much money they can use to buy stocks.
    User can have negative number of money? 
    Fix percentiage everywhere!!!, maybe 0.0001 is ok 
    Cash out functionality?
*/
