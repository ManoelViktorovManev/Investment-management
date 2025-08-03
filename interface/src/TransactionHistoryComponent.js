import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';

const PAGE_SIZE = 10; // Adjust this if you want more/less per page

const TransactionHistoryComponent = () => {
  const [transactions, setTransactions] = useState([]);
  const [transactionHistoryCount, setTransactionHistoryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(transactionHistoryCount / PAGE_SIZE);

  useEffect(() => {
    countAllResultsInDb();
  }, []);

  useEffect(() => {
    fetchTransactionHistory(currentPage);
  }, [currentPage]);

  async function fetchTransactionHistory(page) {
    try {
      const response = await fetch(`${API_BASE_URI}/getTransactionHistory/${page}`);
      if (!response.ok) {
        throw new Error("Failed to fetch transaction history");
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      alert(error.message);
    }
  }

  async function countAllResultsInDb() {
    try {
      const response = await fetch(`${API_BASE_URI}/getTransactionHistoryCountResults`);
      if (!response.ok) {
        throw new Error("Failed to count transaction history");
      }
      const data = await response.json();
      setTransactionHistoryCount(data);
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
        <>
          <table className="min-w-full text-sm border mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Transaction</th>
                <th className="border px-3 py-2">Stock</th>
                <th className="border px-3 py-2">Portfolio</th>
                <th className="border px-3 py-2">Quantity</th>
                <th className="border px-3 py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="border px-3 py-2">{tx.date}</td>
                  <td className="border px-3 py-2">{tx.transaction}</td>
                  <td className="border px-3 py-2">{tx.stockName}</td>
                  <td className="border px-3 py-2">{tx.portfolioName}</td>
                  <td className="border px-3 py-2">{tx.numStocks}</td>
                  <td className="border px-3 py-2">${parseFloat(tx.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export { TransactionHistoryComponent };