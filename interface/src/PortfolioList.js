import React from 'react';
import API_BASE_URI from './EnvVar.js';

const PortfolioList = ({ stocks, setDelete, onStockClick }) => {

  async function onDelete(index) {
    const response = await fetch(`${API_BASE_URI}/deleteStockPorfolio/${index}`);
    if (response.status !== 200) {
      alert("Problem trying to delete stock from portfolio");
    } else {
      setDelete(true);
    }
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial' }}>
      <thead>
        <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
          <th style={cellStyle}>Symbol</th>
          <th style={cellStyle}>Name</th>
          <th style={cellStyle}>Num Shares</th>
          <th style={cellStyle}>Currency</th>
          <th style={cellStyle}>Current Stock Price</th>
          <th style={cellStyle}>Avg Cost/Share</th>
          <th style={cellStyle}>Total Money Invested</th>
          <th style={cellStyle}>Current Market CAP</th>
          <th style={cellStyle}>Return on Investment</th>
          <th style={cellStyle}>% of Portfolio</th>
          <th style={cellStyle}></th>
        </tr>
      </thead>
      <tbody>
        {stocks.map((stock, index) => {
          const roi = stock.returnOfInvestment;
          const roiColor = roi >= 0 ? 'green' : 'red';

          return (
            <tr key={index}>
              {/* Clickable symbol */}
              <td
                style={{ ...cellStyle, color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => onStockClick(stock.stockId)}
              >
                {stock.symbol}
              </td>
              <td
                style={{ ...cellStyle, color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => onStockClick(stock.stockId)}
              >
                {stock.name}
              </td>

              <td style={cellStyle}>{stock.numShares}</td>
              <td style={cellStyle}>{stock.stockCurrency}</td>
              <td style={cellStyle}>${stock.currentPrice}</td>
              <td style={cellStyle}>${stock.averagePricePerStock}</td>
              <td style={cellStyle}>${stock.value}</td>
              <td style={cellStyle}>${stock.currentMarketCap}</td>
              <td style={{ ...cellStyle, color: roiColor }}>{roi}%</td>
              <td style={cellStyle}>{stock.percentage.toFixed(2)}%</td>
              <td style={cellStyle}>
                <button
                  onClick={() => onDelete(stock.idOfDB)}
                  title="Remove stock"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: 'red',
                  }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
const cellStyle = {
  padding: '8px',
  borderBottom: '1px solid #ddd',
};

export default PortfolioList;