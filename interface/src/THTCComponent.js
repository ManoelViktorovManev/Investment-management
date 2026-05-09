import React, { useState, useEffect, useMemo } from 'react';
import API_BASE_URI from './EnvVar.js'; 
const THTCComponent = ({ data, refreshMethods }) => {
  const transactionHistory = data.transactionHistory;
  const users = data.users;
  const settings = data.settings;
  const taxes = data.taxes;
  const allUserTaxes=data.userTaxes;

  // Screen selection: "history" | "tax" | "commission"
  const [screen, setScreen] = useState("history");

  // History filter: "Normal" | "add" | "remove"
  const [filterMode, setFilterMode] = useState("Normal");

  // Commission states
  const [originalCommissions, setOriginalCommissions] = useState({});
  const [editedCommissions, setEditedCommissions] = useState({});
  const [userIdWithName, setUserIdWithName] = useState([]);

  const [selectedTaxId, setSelectedTaxId] = useState(null);

  const matchingUserTaxes = allUserTaxes.filter(
    u => u.taxesId === selectedTaxId
  );

  // Initialize commission states when users change
  useEffect(() => {
    const orig = {};
    const edit = {};
    const userId = [];
    users.forEach(u => {
      orig[u.id] = u.commissionPercent || 0;
      edit[u.id] = u.commissionPercent || 0;
      if(u.id!=null){
        userId[u.id] = u.name;
      }
    });
    setUserIdWithName(userId);
    console.log(userId);
    setOriginalCommissions(orig);
    setEditedCommissions(edit);
  }, [users]);

  // --- FILTERING FOR HISTORY ---
  const filteredData = transactionHistory.filter(t => {
    if (filterMode === "Normal") return true;
    return t.typeTransaction === filterMode;
  });

  // --- COMMISSION HANDLERS ---
  const handleCommissionChange = (id, val) => {
    setEditedCommissions(prev => ({
      ...prev,
      [id]: val
    }));
  };

   
  const handleCommissionCancel = () => {
    setEditedCommissions({ ...originalCommissions });
  };

  const handleCommissionSave = async () => {
    const updates = [];

    Object.keys(originalCommissions).forEach(id => {
      if (Number(originalCommissions[id]) !== Number(editedCommissions[id])) {
        updates.push({
          id,
          commissionPercent: editedCommissions[id]
        });
      }
    });

    if (updates.length === 0) {
      alert("No changes detected.");
      return;
    }

    console.log("Will update:", updates);

    const responseTransaction = await fetch(`${API_BASE_URI}/updateUserCommision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            list:updates
        })
    });
    refreshMethods.refreshUsers();
  };

  const handleTogglePayment = async (userId,taxId) => {
    const responseTransaction = await fetch(`${API_BASE_URI}/updatePayedTaxesAndCommisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            taxId:taxId,
            userId:userId
        })
    });
    refreshMethods.refreshUserTaxes();
  }
  // ---------------- TAX STATE ----------------
  const [taxCompany, setTaxCompany] = useState("");
  const [taxProfit, setTaxProfit] = useState("");
  const [currencySelected,setCurrencySelected] = useState("");

  async function handleSubmitTax(){
    const responseTransaction = await fetch(`${API_BASE_URI}/createTaxes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            company:taxCompany,
            profitFromSale:Number(taxProfit),
            // currency: currencySelected,
            defaultCurrency: settings[0].defaultCurrency
        })
    });
    refreshMethods.refreshTaxes();
    refreshMethods.refreshUserTaxes();

  };

  return (
    <div style={{ padding:"1rem" }}>

      {/* ---------------------- MODE BUTTONS ---------------------- */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"1rem" }}>
        <button onClick={() => setScreen("history")} style={screen === "history" ? btnActive : btnDefault}>
          Transaction History
        </button>
        <button onClick={() => setScreen("tax")} style={screen === "tax" ? btnActive : btnDefault}>
          Taxes
        </button>
        <button onClick={() => setScreen("commission")} style={screen === "commission" ? btnActive : btnDefault}>
          Commission
        </button>
      </div>

      {/* ---------------------- HISTORY SCREEN ---------------------- */}
      {screen === "history" && (
        <div>
          <h2>Transaction History</h2>

          <div style={{ display:"flex", gap:"10px", marginBottom:"1rem" }}>
            <button onClick={() => setFilterMode("Normal")} style={filterMode === "Normal" ? btnActive : btnDefault}>Normal</button>
            <button onClick={() => setFilterMode("add")} style={filterMode === "add" ? btnActive : btnDefault}>Add</button>
            <button onClick={() => setFilterMode("remove")} style={filterMode === "remove" ? btnActive : btnDefault}>Remove</button>
          </div>

          {filteredData.length === 0 && <p style={{ color:"gray" }}>No transactions found.</p>}

          {filteredData.length > 0 && (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f0f0f0" }}>
                  <th style={thStyle}>Person</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Amount change in shares</th>
                  <th style={thStyle}>Price for one share</th>
                  <th style={thStyle}>Total money movement</th>
                  <th style={thStyle}>New number of shares</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((t, index) => (
                  <tr key={index} style={{ borderBottom:"1px solid #ddd" }}>
                    <td style={tdStyle}>{t.person}</td>
                    <td style={tdStyle}>{t.typeTransaction}</td>
                    <td style={tdStyle}>{t.date}</td>
                    <td style={tdStyle}>{Number(t.changePartition).toFixed(2)}</td>
                    <td style={tdStyle}>{Number(t.priceForPartition).toFixed(5)}</td>
                    <td style={tdStyle}>{Number(t.sumChange).toFixed(2)}</td>
                    <td style={tdStyle}>{Number(t.newUserPartitionsNumber).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ---------------------- COMMISSION SCREEN ---------------------- */}
      {screen === "commission" && (
        <div>
          <h2>Commission Settings</h2>

          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f0f0f0" }}>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Commission %</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom:"1px solid #ddd" }}>
                  <td style={tdStyle}>{u.name}</td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      step="0.01"
                      value={Number(editedCommissions[u.id]).toFixed(0)}
                      onChange={e => handleCommissionChange(u.id, Number(e.target.value))}
                      style={{ width:"80px" }}
                    /> %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop:"1rem", display:"flex", gap:"10px" }}>
            <button style={btnDefault} onClick={handleCommissionCancel}>Cancel</button>
            <button style={btnActive} onClick={handleCommissionSave}>OK</button>
          </div>
        </div>
      )}

      {/* ---------------------- TAX SCREEN ---------------------- */}
      {screen === "tax" && (
        <div style={{ maxWidth:"400px" }}>
          <h2>Taxes</h2>

          <label>Company:</label>
          <input style={inputStyle} value={taxCompany} onChange={e => setTaxCompany(e.target.value)} />

          <label>Profit from Sale:</label>
          <input type="number" style={inputStyle} value={taxProfit} onChange={e => setTaxProfit(e.target.value)} />

          {/* <label>Currency:</label>
          <input style={inputStyle} onChange={e => setCurrencySelected(e.target.value)} /> */}


          {/* {(selectedUser && taxProfit) && (
            <div style={{ marginTop:"1rem", border:"1px solid #ddd", padding:"10px", borderRadius:"6px" }}>
              <p>IBTC: {IBTC.toFixed(2)}</p>
              <p>10% Tax: {tax10.toFixed(2)}</p>
              <p>IBC: {IBC.toFixed(2)}</p>
              <p>Commission ({commissionPercent}%): {commission.toFixed(2)}</p>
              <h4>Net income: {netIncome.toFixed(2)}</h4>
            </div>
          )} */}

          <button
            style={{...btnActive, marginTop:"1rem"}}
            disabled={!taxCompany || !taxProfit}
            onClick={handleSubmitTax}
          >
            Submit
          </button>
          <div>
          {/* Taxes list */}
          <h3>All Taxes</h3>
          {taxes.map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTaxId(t.id)}
              style={{ padding: "6px", borderBottom: "1px solid #ddd", cursor:"pointer" }}
            >
              {t.company} - {t.date} - Profit: {Number(t.profitFromSale).toFixed(2)}
            </div>
          ))}

          {/* Detail panel */}
          {selectedTaxId && (
            <div style={{ marginTop:"1rem", border:"1px solid #ccc", padding:"10px" }}>
              <h4>User Taxes for Tax ID: {selectedTaxId}</h4>
              {matchingUserTaxes.length > 0 ? (
                matchingUserTaxes.map(item => (
                  <div key={item.id}>
                    User: {userIdWithName[item.userId]}, IBTC: {Number(item.IBTC).toFixed(2)}, 10% Taxes:{Number(item.taxes10Percent).toFixed(2)}, IBC: {Number(item.IBC).toFixed(2)}, 
                    Commision: {Number(item.commision).toFixed(2)}, Net Income: {Number(item.netIncome).toFixed(2)}
                    <button
                    onClick={() => handleTogglePayment(item.userId, selectedTaxId)}
                    style={{
                      marginLeft: "10px",
                      padding: "4px 10px",
                      backgroundColor: item.taxesAndCommisionPayed ? "green" : "red",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    {item.taxesAndCommisionPayed ? "Paid" : "Not Paid"}
                  </button>

                  </div>
                ))
              ) : (
                <p>No related user taxes.</p>
              )}
            </div>
          )}
        </div>



        </div>
      )}
    </div>
  );
};

// ------------ Styles -------------
const thStyle = { border:"1px solid #ddd", padding:"8px", textAlign:"left" };
const tdStyle = { border:"1px solid #ddd", padding:"8px" };

const btnDefault = {
  padding:"6px 12px",
  borderWidth:"1px",
  borderStyle:"solid",
  borderColor:"#ccc",
  background:"#fff",
  cursor:"pointer"
};

const btnActive = {
  ...btnDefault,
  background:"#007bff",
  color:"white",
  borderColor:"#007bff"
};

const inputStyle = {
  width: "100%",
  padding: "6px",
  marginBottom: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px"
};

export { THTCComponent };
