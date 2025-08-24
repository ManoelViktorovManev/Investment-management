import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
import PortfolioChart from './PortfolioChart';
import { TransactionHistoryComponent } from './TransactionHistoryComponent.js';
import PortfolioList from './PortfolioList';
import ProfitAndTaxesComponent from './ProfitAndTaxesComponent.js';

const UserComponent = ({ data }) => {
    const [users, setUsers] = useState([]);

    const [selectedUserId, setSelectedUserId] = useState("all");
    const [chartData, setChartData] = useState([]);

    const [isGroupByUser, setIsGroupByUser] = useState(false);
    const [allStockInfo, setAllStockInfo] = useState([]);

    const [deletedStock, setDeletedStock] = useState(false);

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

    useEffect(() => {
        if (deletedStock) {
            // getAllValueOfPortfolio(selectedPortfolio);
            setDeletedStock(false);
        }
    }, [deletedStock]);

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
            const combinedStocks = {};
            for (const { stockId, stockQuantity } of raw) {
                const quantity = parseFloat(stockQuantity);
                if (!combinedStocks[stockId]) {
                    combinedStocks[stockId] = 0;
                }
                combinedStocks[stockId] += quantity;
            }

            // Step 2: Enrich for chart
            const enriched = Object.entries(combinedStocks).map(([stockId, quantity]) => {
                const stock = allStockInfo[stockId];
                return {
                    // symbol, percantage, profit
                    name: stock?.name ?? `Stock ${stockId}`,
                    currency: stock?.currency ?? "N/A",
                    stockQuantity: quantity,
                    price: stock?.price ?? 0,
                    marketValue: quantity * (stock?.price || 0),

                };
            });

            setChartData(enriched);
        }
    }
    if (
        !data.settings ||
        data.settings.defaultCurrency == null ||
        data.settings.managingSuperAdmin == null
    ) {
        return (
            <div>
                <h1>Please set defaultCurrency and Super admin in Settings section</h1>
            </div>
        );
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
            {/* Individual transaction history */}
            {selectedUserId == "all" ? (
                <TransactionHistoryComponent key="all" title={"Transaction User History"}
                    fields={["User", "Portfolio", "Stock", "Quantity", "Price", "Date", "Transaction"]} table={"asdf"} />
            ) : (
                <>
                    <TransactionHistoryComponent key={selectedUserId} title={"Transaction History on " + (data.users.find(u => u.id === parseInt(selectedUserId))?.name ?? "Unknown User")}
                        fields={["Portfolio", "Stock", "Quantity", "Price", "Date", "Transaction"]} table={"asdf"} individualTransactionHisory={selectedUserId} />

                    <PortfolioList
                        stocks={chartData}
                        setDelete={setDeletedStock}
                        fields={["Name", "Currency", "Num Shares", "Current Stock Price",
                            "Current Market CAP", ""
                        ]}
                    />
                    <ProfitAndTaxesComponent
                        userId={selectedUserId}
                    />

                </>

            )}


        </div>
    );
}
export { UserComponent };