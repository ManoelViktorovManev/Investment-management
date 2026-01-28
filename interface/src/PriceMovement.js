import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import API_BASE_URI from './EnvVar.js';

// helper: "21.01.2026" → Date
function parseBGDate(dateStr) {
  const [day, month, year] = dateStr.split(".");
  return new Date(`${year}-${month}-${day}`);
}

const PriceMovement = ({ data, refreshMethods }) => {

  // Date range
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Data from backend
  const [historyPrices, setHistoryPrices] = useState([]);

  // ===============================
  // FETCH HISTORY WHEN DATES CHANGE
  // ===============================
  useEffect(() => {
    if (!fromDate || !toDate) return;

    async function loadHistory() {
      const response = await fetch(
        `${API_BASE_URI}/getHistoryPrice/${fromDate}/${toDate}`
      );

      if (response.status === 200) {
        const result = await response.json();

        // Backend → chart format
        const mapped = result.map(r => ({
          date: r.date,
          price: parseFloat(r.sharePrice)
        }));

        setHistoryPrices(mapped);
      }
    }

    loadHistory();
  }, [fromDate, toDate]);

  // ===============================
  // DATA FOR CHART (SYNC ONLY)
  // ===============================
  const filteredData = useMemo(() => {
    return historyPrices;
  }, [historyPrices]);

  return (
    <div style={{ width: '100%', height: 450 }}>
      <h2>Price Movement Over Time</h2>

      {/* DATE FILTERS */}
      <div style={{ marginBottom: 12, display: "flex", gap: "1rem" }}>
        <div>
          <label>From:</label><br />
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label>To:</label><br />
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
        </div>
      </div>

      <ResponsiveContainer>
        <LineChart
          data={filteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3799efff"
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export { PriceMovement };
