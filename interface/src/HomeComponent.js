import React, { useState, useEffect } from 'react';
import PortfolioChart from './PortfolioChart';
import PortfolioList from './PortfolioList';
import API_BASE_URI from './EnvVar.js';
import FormInput from './FormInput.js';
import StockDistributionView from './StockDistributionView.js'

const HomeComponent = ({ data, refreshStocksMethod }) => {

  // infromation about what is selected from the dropdown about the which portfolio to show infromation about.
  const [selectedPortfolio, setSelectedPortfolio] = useState('');

  // infromation about the users and portfolios {'id'=>'name'}
  // about stock it is all infromation {['id', 'name', 'symbol'...]}
  const [usersNamesAndIds, setUsersNamesAndIds] = useState({});
  const [porfoliosNamesAndIds, setPorfoliosNamesAndIds] = useState({});
  const [stocksInfo, setStocksInfo] = useState([]);

  // buttons for handle buy and sell of stocks
  const [showBuyStockForm, setShowBuyStockForm] = useState(false);
  const [showSellStockForm, setShowSellStockForm] = useState(false);



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

  // variable to handle if the user delete some stock from the portfolio
  const [deletedStock, setDeletedStock] = useState(false);

  // variable to handle what is the CashValue of selected Portfolio (Stock Broker) or the entire Portfolio
  const [entireCashValue, setEntireCashValue] = useState(0);

  // id of the stock which is selected to show more information about the ownership of this stock.
  const [selectedStockId, setSelectedStockId] = useState(null);

  /*
    Function that is called to load all data about the users, stocks and portfolios
  */
  useEffect(() => {
    loadAndSetData();
  }, []);



  useEffect(() => {
    if (stocksInfo.length > 0) {
      getAllValueOfPortfolio(selectedPortfolio);
    }
  }, [stocksInfo]);

  /*
    If user click to delete some of the stocks, then to perform again the calculation of the value of the stock.
  */
  useEffect(() => {
    if (deletedStock) {
      getAllValueOfPortfolio(selectedPortfolio);
      setDeletedStock(false);
    }
  }, [deletedStock]);


  /*
    Function called when loading the page. It gets all infromation about users, portfolios and stocks and set them.
  */
  function loadAndSetData() {

    setPorfoliosNamesAndIds(data.portfolios.reduce((map, item) => {
      map[item.id] = item.name;
      return map;
    }, {}));

    setStocksInfo(data.stocks);

    setUsersNamesAndIds(data.users.reduce((map, item) => {
      map[item.id] = item.name;
      return map;
    }, {}));

  }

  // here we are going to remove this shit
  async function getAllStocks() {
    const response = await fetch(`${API_BASE_URI}/getAllStocks`);
    if (response.status !== 200) {
      alert("Problem trying to get all Stocks");
    } else {
      const data = await response.json();
      // console.log(data);
      const stocks = data
        .map(stock => ({
          id: stock.id,
          name: stock.name,
          symbol: stock.symbol,
          currency: stock.currency,
          price: parseFloat(stock.price),
          isCash: stock.isCash
        }));
      setStocksInfo(stocks);
      // console.log(stocks);
    }
  }

  /* method that is called when user select other portfolio to show information about it. 
     It sets and get the valuation 
  */
  const handleChangeofPortfolio = (event) => {
    const selected = event.target.value;
    setSelectedPortfolio(selected);
    if (selected == "") {
      getAllValueOfPortfolio(null)
    }
    else {
      getAllValueOfPortfolio(selected);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStock(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    refreshStocksMethod();
    getAllValueOfPortfolio(selectedPortfolio);
    // getAllStocks();
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
    refreshStocksMethod();
    getAllValueOfPortfolio(selectedPortfolio);
    // getAllStocks();
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
        const stock = stocksInfo.find(s => s.id === item.idStock);
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
      <select onChange={handleChangeofPortfolio}>
        <option key="0" value="">Entire portfolio</option>
        {Object.entries(porfoliosNamesAndIds).map(([id, name]) => (
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
              listOfStocks={stocksInfo}
              onChange={handleInputChange}
              onSubmit={handleBuySubmit}
              portfolioId={selectedPortfolio}
              listOfUsers={usersNamesAndIds}
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
                listOfStocks={stocksInfo}
                onChange={handleInputChange}
                onSubmit={handleSellSubmit}
                portfolioId={selectedPortfolio}
                listOfUsers={usersNamesAndIds}
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
            Portfolio Overview: {porfoliosNamesAndIds[selectedPortfolio]}
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