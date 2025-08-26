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
    async function init() {
      const parsedData = await loadAndSetData();
      setPorfoliosNamesAndIds(parsedData.portfoliosMap);
      setStocksInfo(parsedData.stocks);
      setUsersNamesAndIds(parsedData.usersMap);

      // Now call it after the data is available
      getAllValueOfPortfolio(null, parsedData.stocks);
    }

    init();
  }, []);


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
  async function loadAndSetData() {
    // pretend data comes from somewhere (you can adjust this part if needed)
    const portfoliosMap = data.portfolios.reduce((map, item) => {
      map[item.id] = item.name;
      return map;
    }, {});

    const usersMap = data.users.reduce((map, item) => {
      map[item.id] = item.name;
      return map;
    }, {});
    return {
      portfoliosMap,
      stocks: data.stocks,
      usersMap
    };
  }

  /* 
    Method that is called when user select other portfolio to show information about it. 
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

  /*
    Method that handles user input in form
  */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStock(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  /*
    Method that handles Buy stock or sell stock Submit button.
  */
  async function handleTransactionSubmit(e, actionType) {
    e.preventDefault();

    const endpoint = newStock.isStock
      ? `${API_BASE_URI}/${actionType}StockInPortfolio`
      : `${API_BASE_URI}/${actionType === 'buy' ? 'addCashInPortfolio' : 'removeCashFromPortfolio'}`;

    const response = await fetch(endpoint, {
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
        allocations: newStock.allocations,
        commission: newStock.commission,
        currencyCommission: newStock.currencyCommission
      })
    });

    if (response.status !== 200) {
      alert(`Problem trying to ${actionType === 'buy' ? 'add' : 'remove'} ${newStock.isStock ? 'Stock' : 'Cash'} in portfolio`);
      return;
    }

    setNewStock({
      name: '', symbol: '', currency: '', price: '', quantity: '', isStock: false, allocation: ''
    });

    if (actionType === 'buy') {
      setShowBuyStockForm(false);
    } else {
      setShowSellStockForm(false);
    }

    refreshStocksMethod();
    getAllValueOfPortfolio(selectedPortfolio);
  }


  function getConversionRate(fromSymbol, toSymbol, exchangeRates) {

    if (fromSymbol === toSymbol) return 1;

    const direct = exchangeRates.find(
      r => r.firstSymbol == fromSymbol && r.secondSymbol == toSymbol
    );
    if (direct) return parseFloat(direct.rate);


    const reverse = exchangeRates.find(
      r => r.firstSymbol == toSymbol && r.secondSymbol == fromSymbol
    );
    if (reverse) return 1 / parseFloat(reverse.rate);

    return null;
  }

  async function getAllValueOfPortfolio(portfolioId, stocksList = null) {
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
      // if we didn`t select any portfolio (we get all stocks from every portfolio)
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
          // if we already have added the id => Example i have USD in one account and now it is found in another one.
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

      // Final mapping to UI format
      const mapped = combined.map(item => {
        var stock;
        if (stocksList == null) {
          stock = stocksInfo.find(s => s.id === item.idStock);
        }
        else {
          stock = stocksList.find(s => s.id === item.idStock);
        }
        if (!stock) return null;

        const numStocks = parseFloat(item.numStocks);
        const valueOfStock = parseFloat(item.valueOfStock);

        var rate = null;
        if (stock.currency != data.settings.defaultCurrency) {
          rate = getConversionRate(stock.currency, data.settings.defaultCurrency, data.exchangeRates);
          entireCashValue = entireCashValue + parseFloat(((stock.price * numStocks) * rate).toFixed(2));

        }
        else {
          entireCashValue = entireCashValue + (parseFloat((stock.price * numStocks).toFixed(2)));
        }
        setEntireCashValue(entireCashValue);
        return {
          stockId: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          stockCurrency: stock.currency,
          numShares: numStocks,
          currentPrice: stock.price,
          averagePricePerStock: (valueOfStock / numStocks).toFixed(2),
          value: valueOfStock,
          currentMarketCap: parseFloat((stock.price * numStocks).toFixed(2)),
          valueInSelectedCurrency: rate != null ? parseFloat(((stock.price * numStocks) * rate).toFixed(2)) : parseFloat((stock.price * numStocks).toFixed(2)),
          selectedCurrency: data.settings.defaultCurrency,
          returnOfInvestment: ((stock.price * numStocks - valueOfStock) / valueOfStock * 100).toFixed(2),
          percentage: 0,
          idOfDB: item.id
        };
      }).filter(Boolean); // remove nulls
      setStockData(mapped);
    }
  }
  if (
    !data.settings ||
    data.settings.defaultCurrency == null ||
    data.settings.managingSuperAdmin == null
  ) {
    return (
      <div>
        <h1>Please set defaultCurrency and Super admin in Settings section</h1>
      </div>
    );
  }


  return (
    < div >
      <select onChange={handleChangeofPortfolio}>
        <option key="0" value="">Entire portfolio</option>
        {Object.entries(porfoliosNamesAndIds).map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>


      {
        selectedPortfolio !== '' && (

          <div>
            <button type="button" onClick={() => setShowBuyStockForm(prev => !prev)}>
              {showBuyStockForm ? 'Hide Buy Stock/Insert Cash' : 'Buy Stock/Insert Cash'}
            </button>

            <button type="button" onClick={() => setShowSellStockForm(prev => !prev)}>
              {showSellStockForm ? 'Hide Sell Stock/Remove Cash' : 'Sell Stock/Remove Cash'}
            </button>
          </div>

        )
      }

      {/* Buying stock */}
      {
        showBuyStockForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setShowBuyStockForm(false)}>×</button>
              <FormInput
                title="Buy Stock/Insert Cash"
                stock={newStock}
                listOfStocks={stocksInfo}
                onChange={handleInputChange}
                onSubmit={(e) => handleTransactionSubmit(e, 'buy')}
                portfolioId={selectedPortfolio}
                listOfUsers={usersNamesAndIds}
              />
            </div>
          </div>
        )
      }
      {/* Selling stock */}
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
                onSubmit={(e) => handleTransactionSubmit(e, 'sell')}
                portfolioId={selectedPortfolio}
                listOfUsers={usersNamesAndIds}
              />
            </div>
          </div>
        )
      }


      {
        selectedStockId ? (
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
            <h3>Current value: {entireCashValue} {data.settings.defaultCurrency}</h3>
            <PortfolioList
              stocks={stockData}
              setDelete={setDeletedStock}
              onStockClick={(stockId) => setSelectedStockId(stockId)}
              fields={["Symbol", "Name", "Currency", "Num Shares", "Current Stock Price", "Avg Cost/Share",
                "Total Money Invested", "Current Market CAP", "Value by selected Currency", "Return on Investment",
                "% of Portfolio", ""
              ]}
            />
          </>
        )
      }
    </div >
  );
};
export { HomeComponent };