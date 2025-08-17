import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';

const PAGE_SIZE = 10; // Adjust this if you want more/less per page

const TransactionHistoryComponent = ({ title, fields, table, individualTransactionHisory = null }) => {
  const [transactions, setTransactions] = useState([]);
  const [transactionHistoryCount, setTransactionHistoryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(transactionHistoryCount / PAGE_SIZE);

  useEffect(() => {
    countAllResultsInDb();
  }, []);

  useEffect(() => {
    fetchTransactionHistory(currentPage);
  }, [currentPage, individualTransactionHisory]);

  // again from which table
  async function fetchTransactionHistory(page) {
    try {
      var response;
      if (individualTransactionHisory != null) {
        response = await fetch(`${API_BASE_URI}/getTransactionHistory/${table}/${page}/${individualTransactionHisory}`);
      }
      else {
        response = await fetch(`${API_BASE_URI}/getTransactionHistory/${table}/${page}/`);
      }

      if (!response.ok) {
        throw new Error("Failed to fetch transaction history");
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      alert(error.message);
    }
  }

  // we should handle from which tabel 
  async function countAllResultsInDb() {
    try {
      var response;
      if (individualTransactionHisory != null) {
        response = await fetch(`${API_BASE_URI}/getTransactionHistoryCountResults/${table}/${individualTransactionHisory}`);
      }
      else {
        response = await fetch(`${API_BASE_URI}/getTransactionHistoryCountResults/${table}/`);
      }

      // const response = await fetch(`${API_BASE_URI}/getTransactionHistoryCountResults/${table}/`);
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
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <>
          <table className="min-w-full text-sm border mb-4">
            <thead className="bg-gray-100">
              <tr>
                {fields.map((element, index) => (
                  <th key={index} className="border px-3 py-2">{element}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  {Object.values(tx).map((value, i) => (
                    <td key={i} className="border px-3 py-2">
                      {value}
                    </td>
                  ))}
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