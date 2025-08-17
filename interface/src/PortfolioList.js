import React from 'react';
import API_BASE_URI from './EnvVar.js';

const PortfolioList = ({ stocks, setDelete, onStockClick, fields }) => {

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

          {fields.map((element, index) => (
            <th key={index} style={cellStyle}>{element}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {stocks.map((stock, index) => (
          <tr key={index}>
            {Object.entries(stock).map(([key, value], i) => {
              // Special case: Clickable fields
              if ((key === 'symbol' || key === 'name') && onStockClick != null) {
                return (
                  <td
                    key={i}
                    style={{ ...cellStyle, color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => onStockClick(stock.stockId)}
                  >
                    {value}
                  </td>
                );
              }

              // Special case: ROI color
              if (key === 'returnOfInvestment') {
                const roiColor = value >= 0 ? 'green' : 'red';
                return (
                  <td key={i} style={{ ...cellStyle, color: roiColor }}>
                    {value}%
                  </td>
                );
              }

              // Regular case
              if (key != "stockId" && key != "selectedCurrency" && key != "idOfDB") {
                return (
                  <td key={i} style={cellStyle}>
                    {value}
                  </td>
                );
              }

            })}

            {/* Last column: Delete button */}
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
        ))}
      </tbody>
    </table>
  );
};
const cellStyle = {
  padding: '8px',
  borderBottom: '1px solid #ddd',
};

export default PortfolioList;