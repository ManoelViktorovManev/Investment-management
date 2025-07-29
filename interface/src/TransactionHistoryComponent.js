import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';

const TransactionHistoryComponent = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactionHistory(0);
  }, []);

  async function fetchTransactionHistory(id) {
    try {
      const response = await fetch(`${API_BASE_URI}/getTransactionHistory/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transaction history");
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="mt-6 p-4 border rounded shadow bg-white">
      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Transaction</th>
              <th className="border px-3 py-2">Stock ID</th>
              <th className="border px-3 py-2">Portfolio ID</th>
              <th className="border px-3 py-2">Quantity</th>
              <th className="border px-3 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="border px-3 py-2">{tx.date}</td>
                <td className="border px-3 py-2">{tx.transaction}</td>
                <td className="border px-3 py-2">{tx.idStock}</td>
                <td className="border px-3 py-2">{tx.idPortfolio}</td>
                <td className="border px-3 py-2">{tx.numStocks}</td>
                <td className="border px-3 py-2">${parseFloat(tx.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export { TransactionHistoryComponent };