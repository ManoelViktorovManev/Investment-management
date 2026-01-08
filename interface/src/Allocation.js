import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#3799efff','#1900ffff' , '#00ff62ff', '#FFBB28', '#ff0000ff', '#aa00ff', '#e6ff03ff', '#2f9f40ff' , '#000000', '#ff009dff'];

const Allocation = ({ data }) => {
  var users = data.users;
  var settings = data.settings;

  var enitrePortfolioPrice = (Number(settings[0].allShares) * Number(settings[0].sharePrice)).toFixed(2);

  const [shareState,setShareState] = useState(true);

  const chartDataShares = users.map(u => (
    {
      name:u.name,
      value: Number(u.shares)
    }
  ))
  const chartDataUsersMoney = users.map(u=>({
    name:u.name,
    value: parseFloat((u.shares * settings[0].sharePrice).toFixed(2))
  }))
  return (
    <div>
       <button className="px-2 py-1 bg-green-500 text-white rounded mr-2"  onClick={() => {
        if(shareState==true){
          setShareState(false);
        }
        else{
          setShareState(true);
        }
       }}>
          {shareState?"Show money":"Show shares"}
        </button>
      <PieChart width={400} height={400}>
      <Pie
        data={shareState?chartDataShares:chartDataUsersMoney}
        cx="50%"
        cy="50%"
        label
        outerRadius={120}
        fill="#8884d8"
        dataKey="value"
      >
        {chartDataShares.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
    <h1>{shareState?"Entire shares: "+  Number(settings[0].allShares).toFixed(2):"Entire value of portfolio: "+ enitrePortfolioPrice } </h1>
    </div>
    
  );
};

export { Allocation };
