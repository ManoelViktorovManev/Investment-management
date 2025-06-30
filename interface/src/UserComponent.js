import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
import PortfolioChart from './PortfolioChart';
const UserComponent = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [userName, setUserName] = useState("");


    const [selectedUserId, setSelectedUserId] = useState("all");
    const [chartData, setChartData] = useState([]);

    const [isGroupByUser, setIsGroupByUser] = useState(false);
    const [allStockInfo, setAllStockInfo] = useState([]);

    useEffect(() => {
        showAllUsers();
        getAllStockInfo();
        getAllStocksOwnedByUser(null);
    }, []);


    async function getStockInfo(stockId) {
        const res = await fetch(`${API_BASE_URI}/getSingleStockData/${stockId}`);
        if (!res.ok) throw new Error("Failed to get stock info");

        const [info] = await res.json(); // We expect one-element array
        return {
            name: info.name,
            price: parseFloat(info.price),
            currency: info.currency
        };
    }

    async function getAllStockInfo() {
        const allStocksResponse = await fetch(`${API_BASE_URI}/getAllStocks`);
        if (!allStocksResponse.ok) throw new Error("Failed to get all stock info");
        const allStocks = await allStocksResponse.json(); // full stock metadata

        // Create map for fast access: { stockId: stockInfo }
        const stockMap = {};
        for (const stock of allStocks) {
            stockMap[stock.id] = {
                name: stock.name,
                price: parseFloat(stock.price),
                currency: stock.currency,
            };
        }
        setAllStockInfo(stockMap);

    }
    async function getAllStocksOwnedByUser(userId) {
        // OPTIMIZE THIS BECAUSE IT IS SOOO SLOW
        const isAll = userId === null || userId === "all";
        setIsGroupByUser(isAll);

        const url = isAll
            ? `${API_BASE_URI}/getAllStocksOneUserOwns/`
            : `${API_BASE_URI}/getAllStocksOneUserOwns/${userId}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch stock ownership");

        const raw = await response.json();

        if (isAll) {
            // Group total value per user
            const groupedByUser = {};

            for (const { userId, stockId, stockQuantity } of raw) {
                const quantity = parseFloat(stockQuantity);
                const price = allStockInfo[stockId]?.price || 0;

                if (!groupedByUser[userId]) groupedByUser[userId] = 0;
                groupedByUser[userId] += quantity * price;
            }

            const finalChartData = Object.entries(groupedByUser).map(([userId, totalValue]) => {
                const user = users.find(u => u.id === parseInt(userId));
                return {
                    name: user?.name ?? `User ${userId}`,
                    totalValue: parseFloat(totalValue.toFixed(2)),
                };
            });

            setChartData(finalChartData);
        } else {
            // Show per-stock breakdown for selected user
            const enriched = raw.map(({ stockId, stockQuantity }) => {
                const stock = allStockInfo[stockId];
                const quantity = parseFloat(stockQuantity);
                return {
                    name: stock?.name ?? `Stock ${stockId}`,
                    stockQuantity: quantity,
                    marketValue: quantity * (stock?.price || 0),
                    price: stock?.price ?? 0,
                    currency: stock?.currency ?? "N/A",
                };
            });

            setChartData(enriched);
        }
    }

    async function addNewUser() {

        const response = await fetch(`${API_BASE_URI}/createNewUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "name": userName })
        });
        if (response.status != 200) {
            alert("Problem trying to create a new User");
        }
        showAllUsers();
    }

    async function removeUser(id) {
        const response = await fetch(`${API_BASE_URI}/deleteUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "id": id })
        });
        if (response.status != 200) {
            alert("Problem trying to delete an User");
        }
        showAllUsers();
    }

    async function showAllUsers() {
        const response = await fetch(`${API_BASE_URI}/getAllUsers`, {
            method: 'GET'
        });
        if (response.status != 200) {
            alert("Problem trying to get all Users");
        }
        else {
            const data = await response.json();
            setUsers(data);
        }
    }

    return (
        <div>
            <h1>User manipulation</h1>
            <label htmlFor="user-select">Select user: </label>
            <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => {
                    const selected = e.target.value;
                    setSelectedUserId(selected);
                    if (selected === "all") {
                        getAllStocksOwnedByUser(null); // or handle differently
                    } else {
                        getAllStocksOwnedByUser(selected);
                    }
                }}
            >
                <option value="all">All users</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name}
                    </option>
                ))}
            </select>

            <button onClick={() => setShowModal(true)}>Add User</button>

            {isGroupByUser ? (
                <h3>Total Combined Portfolio: USD {chartData.reduce((sum, user) => sum + user.totalValue, 0).toFixed(2)}</h3>
            ) : (
                <h3>Total Portfolio Value: USD {chartData.reduce((sum, stock) => sum + stock.marketValue, 0).toFixed(2)}</h3>
            )}
            <PortfolioChart data={chartData} dataKey={isGroupByUser ? "totalValue" : "stockQuantity"} />


            {/* <ul style={{ marginTop: '20px' }}>
                {users.map((user) => (
                    <li key={user.id} style={{ marginBottom: '10px' }}>
                        <strong>Name:</strong> {user.name} <br />
                        <button onClick={() => removeUser(user.id)} style={{ marginTop: '5px' }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul> */}


            {/* Adding a new user */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    backgroundColor: 'white',
                    border: '1px solid black',
                    borderRadius: '8px',
                    zIndex: 1000
                }}>
                    <h3>New User</h3>
                    <input
                        type="text"
                        placeholder="User Name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        style={{ display: 'block', marginBottom: '10px' }}
                    />
                    <button onClick={addNewUser}>Submit</button>
                    <button onClick={() => setShowModal(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                </div>
            )}
        </div>
    );
}
export { UserComponent };