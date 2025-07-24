import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
import PortfolioChart from './PortfolioChart';
const UserComponent = ({ data }) => {
    const [users, setUsers] = useState([]);

    const [selectedUserId, setSelectedUserId] = useState("all");
    const [chartData, setChartData] = useState([]);

    const [isGroupByUser, setIsGroupByUser] = useState(false);
    const [allStockInfo, setAllStockInfo] = useState([]);

    useEffect(() => {
        setUsers(data.users);

        const stockMap = {};
        for (const stock of data.stocks) {
            stockMap[stock.id] = {
                name: stock.name,
                price: parseFloat(stock.price),
                currency: stock.currency,
            };
        }
        setAllStockInfo(stockMap);

    }, [data]);

    // Trigger fetch only after both users and allStockInfo are set
    useEffect(() => {
        if (Object.keys(allStockInfo).length > 0 && users.length > 0) {
            getAllStocksOwnedByUser(null);
        }
    }, [allStockInfo, users]);

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
            // here down there is an bug
            for (const { userId, stockId, stockQuantity } of raw) {
                // ok
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


            {isGroupByUser ? (
                <h3>Total Combined Portfolio: USD {chartData.reduce((sum, user) => sum + user.totalValue, 0).toFixed(2)}</h3>
            ) : (
                <h3>Total Portfolio Value: USD {chartData.reduce((sum, stock) => sum + stock.marketValue, 0).toFixed(2)}</h3>
            )}
            <PortfolioChart data={chartData} dataKey={isGroupByUser ? "totalValue" : "stockQuantity"} />
        </div>
    );
}
export { UserComponent };