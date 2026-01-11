import React, { useState, useEffect } from 'react';

const THTCComponent = ({ data, refreshMethods }) => {
  const transactionHistory = data.transactionHistory;
  const users = data.users;

  // Screen selection: "history" | "tax" | "commission"
  const [screen, setScreen] = useState("history");

  // History filter: "Normal" | "add" | "remove"
  const [filterMode, setFilterMode] = useState("Normal");

  // Commission states
  const [originalCommissions, setOriginalCommissions] = useState({});
  const [editedCommissions, setEditedCommissions] = useState({});

  // Initialize commission states when users change
  useEffect(() => {
    const orig = {};
    const edit = {};
    users.forEach(u => {
      orig[u.id] = u.commissionPercent || 0;
      edit[u.id] = u.commissionPercent || 0;
    });
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

    // ❗ Call your API here instead of console.log
    // for (const change of updates) {
    //   await fetch(...);
    // }

    refreshMethods.refreshUsers();
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
                      value={editedCommissions[u.id]}
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
      {screen === "tax" && <h2>Taxes — Coming next...</h2>}
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

export { THTCComponent };
