import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';
const FormInput = ({ onSubmit, onChange, stock, title, listOfUsers, portfolioId, listOfStocks }) => {
    const [customAllocation, setCustomAllocation] = useState(false);
    const [equalSplit, setEqualSplit] = useState(false);
    const [proportionalToWalletBalance, setProportionalToWalletBalance] = useState(false);

    const [allocations, setAllocations] = useState({});
    const [userCashInfo, setUserCashInfo] = useState([]);

    const totalCost = (stock.price || 0) * (stock.quantity || 0);

    const handleAllocationChange = (userId, value) => {
        setAllocations(prev => ({ ...prev, [userId]: Number(value) }));
    };

    // maybe we need to add text about current amount of money and current amount of stocks.
    async function getAviableCashFromEveryUserFromPortfolio(portfolioId) {
        const response = await fetch(`${API_BASE_URI}/getUsersFreeCashInPortfolio/${portfolioId}`, {
            method: 'GET'
        });
        if (response.status !== 200) {
            alert("Problem trying to get all Stocks");
        } else {
            const data = await response.json();
            setUserCashInfo(data);
        }
    }

    function getCashTextForUser(userId) {
        const entries = userCashInfo.filter(item => item.userId === Number(userId));
        if (entries.length === 0) return "No cash";

        return entries.map(entry => {
            const stockMeta = listOfStocks.find(stock => stock.id === entry.stockId);
            return `${entry.stockQuantity} ${stockMeta.symbol}`;
        }).join(', ');
    };

    async function getEquitySplitBetweenUsers(portfolioId) {
        const response = await fetch(`${API_BASE_URI}/getUsersFreeCashInPortfolio/${portfolioId}`, {
            method: 'GET'
        });
        if (response.status !== 200) {
            alert("Problem trying to get all Stocks");
        } else {
            const data = await response.json();
            setUserCashInfo(data);
        }

    }
    useEffect(() => {
        getAviableCashFromEveryUserFromPortfolio(portfolioId);
    }, []);


    const totalAllocated = Object.values(allocations).reduce((sum, val) => {
        return sum + (stock.isStock ? val * (stock.price || 0) : val);
    }, 0);

    return (
        <form onSubmit={(e) => {
            if (customAllocation) {
                const expected = stock.isStock
                    ? Number(stock.quantity) * Number(stock.price)
                    : Number(stock.quantity);

                if (totalAllocated !== expected) {
                    e.preventDefault();
                    alert(`Total allocated (${totalAllocated.toFixed(2)}) does not match expected amount (${expected.toFixed(2)})`);
                    return;
                }
            }
            stock.allocations = allocations;
            onSubmit(e);
        }} style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>

            <h4>{title}</h4>

            {/* Checkbox for Stock */}
            <div>
                <label>
                    Is Stock? (not marked means Cash):
                    <input
                        type="checkbox"
                        name="isStock"
                        checked={stock.isStock || false}
                        onChange={onChange}
                    />
                </label>
            </div>

            {/* Basic Fields */}
            {['name', 'symbol', 'currency', 'price', 'quantity', 'transactionDate']
                .filter(field => !(!stock.isStock && ['name', 'symbol', 'price'].includes(field)))
                .map((field) => (
                    <div key={field}>
                        <label>
                            {field.charAt(0).toUpperCase() + field.slice(1)}:
                            <input
                                type={field === 'transactionDate' ? 'date' : (field === 'price' || field === 'quantity') ? 'number' : 'text'}
                                name={field}
                                step="0.01"
                                value={stock[field] || ''}
                                onChange={onChange}
                                required
                            />
                        </label>
                    </div>
                ))}

            {stock.isStock && (
                <div><strong>Total Cost:</strong> {totalCost.toFixed(2)} {stock.currency || ''}</div>
            )}

            {/* User & Allocation (only for cash) */}

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={customAllocation}
                        onChange={(e) => setCustomAllocation(e.target.checked)}
                    />
                    Custom Allocation
                </label>

                {stock.isStock && (
                    <div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={equalSplit}
                                    onChange={(e) => setEqualSplit(e.target.checked)}
                                />
                                Equal Split
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={proportionalToWalletBalance}
                                    onChange={(e) => setProportionalToWalletBalance(e.target.checked)}
                                />
                                Proportional to Wallet Balance
                            </label>
                        </div>

                    </div>
                )}
            </div>

            {customAllocation && (

                <div style={{ padding: '0.5rem', border: '1px dashed #999', marginBottom: '1rem' }}>
                    {Object.entries(listOfUsers).map(([id, name]) => (
                        <div key={id} style={{ marginBottom: '0.5rem' }}>
                            <label>
                                {name} ({getCashTextForUser(id)}):
                                <input
                                    type="number"
                                    min="0"
                                    step="0.00000001"
                                    value={allocations[id] !== undefined ? allocations[id] : ''}
                                    onChange={(e) => handleAllocationChange(id, e.target.value)}
                                    style={{ marginLeft: '0.5rem' }}
                                />
                            </label>
                            {stock.isStock && allocations[id] > 0 && (
                                <small style={{ marginLeft: '1rem' }}>
                                    Cost: {(allocations[id] * (stock.price || 0)).toFixed(2)} {stock.currency}
                                </small>
                            )}
                        </div>
                    ))}
                    <small>Total allocated: {totalAllocated.toFixed(2)}</small>
                </div>
            )
            }
            <button type="submit">Submit</button>
        </form>
    );
};

export default FormInput;