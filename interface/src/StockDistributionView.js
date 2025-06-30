import React, { useState, useEffect } from 'react';
import PortfolioChart from './PortfolioChart';
import API_BASE_URI from './EnvVar.js';
import StockDistributionList from './StockDistributionList.js';
const StockDistributionView = ({ stock, goBack }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    async function getAllStockOwners(stockId) {
        try {
            const response = await fetch(`${API_BASE_URI}/getAllOwnersOfStock/${stockId}`);
            if (response.status !== 200) throw new Error("Failed to fetch stock owners");

            const owners = await response.json(); // [{ userId, stockQuantity }]

            // Fetch names in parallel
            const enriched = await Promise.all(
                owners.map(async owner => {
                    const userResponse = await fetch(`${API_BASE_URI}/getUser/${owner.userId}`);
                    if (userResponse.status !== 200) {
                        console.warn(`Failed to fetch user ${owner.userId}`);
                        return null;
                    }
                    const user = await userResponse.json();
                    const quantity = parseFloat(owner.stockQuantity);
                    const percentage = (quantity / stock.numShares);
                    return {
                        percentage: percentage * 100,
                        userId: owner.userId,
                        name: user.name,
                        stockQuantity: quantity,
                        currentMarketCap: percentage * stock.currentMarketCap
                    };
                })
            );

            // Filter out any nulls (users who failed to fetch)
            const cleaned = enriched.filter(e => e !== null);
            console.log(cleaned);
            console.log(stock);
            setChartData(cleaned);
        } catch (err) {
            console.error(err);
            alert("Failed to load stock distribution data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAllStockOwners(stock.stockId);
    }, []);


    return (
        <div>
            <button onClick={goBack} style={{ marginBottom: '1rem' }}>← Back to Portfolio</button>
            <p>
                Stock Distribution on: <strong>{stock.name}</strong>
            </p>

            <p>
                Entire stock amount: <strong>{stock.numShares}</strong>
            </p>

            <p>
                Value of all stocks: <strong>{stock.currentMarketCap} {stock.stockCurrency}</strong>
            </p>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {chartData.length > 0 ? (
                        <div>
                            <PortfolioChart data={chartData} dataKey="stockQuantity" />
                            <StockDistributionList usersData={chartData} />
                        </div>

                        // <StockDistriv>
                        // we should add destribution
                    ) : (
                        <p>No data available for this stock.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default StockDistributionView;