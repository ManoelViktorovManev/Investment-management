import React from 'react';
import PortfolioChart from './PortfolioChart';
import PortfolioList from './PortfolioList';

const stockData = [
  { symbol: 'AAPL', name: 'Apple', value: 27000, percentage: 69 },
  { symbol: 'NFLX', name: 'Netflix', value: 3000, percentage: 1 },
  { symbol: 'Cash', name: 'Lev Cash', value: 30000, percentage: 1 },
  
];

const HomeComponent = () => {
  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6">Portfolio Overview</h2>
      <PortfolioChart data={stockData} />
      <h3 className="text-xl font-medium mt-8 mb-2">Stock Breakdown</h3>
      <PortfolioList stocks={stockData} />
    </div>
  );
};

export { HomeComponent };