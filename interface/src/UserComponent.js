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
        const isAll = userId === null || userId === "all";
        setIsGroupByUser(isAll);

        const url = isAll
            ? `${API_BASE_URI}/getAllStocksOneUserOwns/`
            : `${API_BASE_URI}/getAllStocksOneUserOwns/${userId}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch stock ownership");

        const raw = await response.json();

        if (isAll) {
            const groupedByUser = {};

            for (const { userId, stockId, stockQuantity } of raw) {
                const quantity = parseFloat(stockQuantity);
                const stock = allStockInfo[stockId];
                if (!stock) continue;

                let valueInDefaultCurrency = 0;

                if (stock.currency !== data.settings.defaultCurrency) {
                    const rate = getConversionRate(
                        stock.currency,
                        data.settings.defaultCurrency,
                        data.exchangeRates
                    );
                    valueInDefaultCurrency = (stock.price * quantity) * rate;
                } else {
                    valueInDefaultCurrency = stock.price * quantity;
                }

                if (!groupedByUser[userId]) groupedByUser[userId] = 0;
                groupedByUser[userId] += valueInDefaultCurrency;
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
                let valueInDefaultCurrency = 0;
                let rate = null;
                if (stock.currency != data.settings.defaultCurrency) {
                    rate = getConversionRate(stock.currency, data.settings.defaultCurrency, data.exchangeRates);
                    valueInDefaultCurrency = parseFloat(((stock.price * quantity) * rate).toFixed(2));
                }
                else {
                    valueInDefaultCurrency = (parseFloat((stock.price * quantity).toFixed(2)));
                }
                return {
                    // symbol, percantage, profit
                    name: stock?.name ?? `Stock ${stockId}`,
                    currency: stock?.currency ?? "N/A",
                    stockQuantity: quantity,
                    price: stock?.price ?? 0,
                    marketValue: quantity * (stock?.price || 0),
                    valueInDefCurrency: valueInDefaultCurrency
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

    function getConversionRate(fromSymbol, toSymbol, exchangeRates) {

        if (fromSymbol === toSymbol) return 1;

        const direct = exchangeRates.find(
            r => r.firstSymbol == fromSymbol && r.secondSymbol == toSymbol
        );
        if (direct) return parseFloat(direct.rate);


        const reverse = exchangeRates.find(
            r => r.firstSymbol == toSymbol && r.secondSymbol == fromSymbol
        );
        if (reverse) return 1 / parseFloat(reverse.rate);

        return null;
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
                <h3>Total Combined Portfolio: {data.settings.defaultCurrency} {chartData.reduce((sum, user) => sum + user.totalValue, 0).toFixed(2)}</h3>
            ) : (
                <h3>Total Portfolio Value: {data.settings.defaultCurrency} {chartData.reduce((sum, stock) => sum + stock.valueInDefCurrency, 0).toFixed(2)}</h3>
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
                            "Current Market CAP", "Market Cap by Default Currency " + data.settings.defaultCurrency, ""
                        ]}
                    />
                    <ProfitAndTaxesComponent
                        superAdmin={data.settings.managingSuperAdmin}
                        userId={selectedUserId}
                    />

                </>

            )}


        </div>
    );
}
export { UserComponent };