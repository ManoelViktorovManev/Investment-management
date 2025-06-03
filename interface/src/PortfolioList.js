import React from 'react';

const PortfolioList = ({ stocks }) => (
  <table>
    <thead>
      <tr>
        <th>Symbol</th>
        <th>Name</th>
        <th>Value</th>
        <th>% of Portfolio</th>
      </tr>
    </thead>
    <tbody>
      {stocks.map((stock, index) => (
        <tr key={index}>
          <td>{stock.symbol}</td>
          <td>{stock.name}</td>
          <td>${stock.value.toFixed(2)}</td>
          <td>{stock.percentage}%</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default PortfolioList;