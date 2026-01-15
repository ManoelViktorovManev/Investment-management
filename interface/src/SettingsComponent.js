import React, { useState } from 'react';
import API_BASE_URI from './EnvVar.js';
const SettingsComponent = ({ data, refreshMethods }) => {
  
  var rates = data.rates;
  var sharePrice = data.settings[0].sharePrice;
  var settingsDefaultCurrency = data.settings[0].defaultCurrency;
  const [showCurrencySettings, setShowCurrencySettings] = useState(false);

  const [defaultCurrency, setDefaultCurrency] = useState(settingsDefaultCurrency);
  const [updateRate, setUpdateRate] = useState("");

  // For adding new rate
  const [firstCurrency, setFirstCurrency] = useState("");
  const [secondCurrency, setSecondCurrency] = useState("");
  const [newRate, setNewRate] = useState("");

  async function handleAddRate(){
    if (!firstCurrency || !secondCurrency) {
      alert("Currency codes cannot be empty");
      return;
    }

    const rate = Number(newRate);
    if (!rate || rate <= 0) {
      alert("Rate must be a valid positive number");
      return;
    }

    const newRateObj = { firstCurrency: firstCurrency.toUpperCase(), secondCurrency: secondCurrency.toUpperCase(), rate };

    
    const response = await fetch(`${API_BASE_URI}/createNewCurrencyRate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              firstCurrency: newRateObj.firstCurrency,
              secondCurrency: newRateObj.secondCurrency,
              rate: rate
          })
      });

    refreshMethods.refreshRates();
    // Reset fields
    setFirstCurrency("");
    setSecondCurrency("");
    setNewRate("");
  };

  async function handleDelete(index){
    const response = await fetch(`${API_BASE_URI}/deleteExchangeRate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              id:index
          })
      });
      refreshMethods.refreshRates();
  };

  async function handleUpdateRate(index) {
    const response = await fetch(`${API_BASE_URI}/updateExchangeRate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id:index,
            rate:Number(updateRate).toFixed(5)
        })
    });
  };

  async function callForUpdateCurrency(newCurrency){
    const response = await fetch(`${API_BASE_URI}/updateSettings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            defaultCurrency:newCurrency
        })
    });
  }

  return (
    <div style={{ padding: "1rem" }}>
      
      <button onClick={() => setShowCurrencySettings(!showCurrencySettings)}>
        {showCurrencySettings ? "Hide Currency Settings" : "Show Currency Settings"}
      </button>

      {showCurrencySettings && (
        <div style={{ marginTop: "1rem" }}>
          {/* Default Currency */}
          <h3>Default Currency</h3>
          <select
            value={defaultCurrency}
            onChange={(e) => {
              setDefaultCurrency(e.target.value)
              callForUpdateCurrency(e.target.value);
            }}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>

          <hr />

          <h3>Share Price</h3>
          <p>{Number(sharePrice).toFixed(5)}</p>
          <hr />

          {/* Existing Exchange Rates */}
          <h3>Exchange Rates</h3>
          {rates.length === 0 && <p>No exchange rates yet.</p>}

          {rates.map((r, index) => (
            <div key={index} style={{ display:"flex", gap:"10px", marginBottom:"8px", alignItems:"center" }}>
              <strong>{r.firstCurrency} / {r.secondCurrency}</strong>

              <input
                type="number"
                step="0.0001"
                value={updateRate === "" ? r.rate : updateRate}
                onChange={(e) =>setUpdateRate(e.target.value)}
                style={{ width:"100px" }}
              />
              <button onClick={() => handleUpdateRate(r.id)}>Update rate</button>
              <button onClick={() => handleDelete(r.id)}>Delete</button>
            </div>
          ))}

          <hr />

          {/* Add New Exchange Rate */}
          <h3>Add Exchange Rate</h3>
          <div style={{ display:"flex", gap:"10px", marginBottom:"10px" }}>
            <input
              placeholder="EUR"
              value={firstCurrency}
              onChange={(e) => setFirstCurrency(e.target.value.toUpperCase())}
              style={{ width:"60px" }}
            />

            <input
              placeholder="JPY"
              value={secondCurrency}
              onChange={(e) => setSecondCurrency(e.target.value.toUpperCase())}
              style={{ width:"60px" }}
            />

            <input
              placeholder="Rate"
              type="number"
              step="0.0001"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              style={{ width:"100px" }}
            />

            <button onClick={handleAddRate}>Add</button>
          </div>
        </div>
      )}

    </div>
  );
};

export { SettingsComponent };
