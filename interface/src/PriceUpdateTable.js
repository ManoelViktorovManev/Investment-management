import React, { useState, useEffect } from 'react';
const PriceUpdateTable = ({ title, items, onChange, onConfirm }) => (
    <div style={{ marginTop: '1rem' }}>
        <h3>{title}</h3>
        <table>
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Currency</th>
                    <th>New Price</th>
                </tr>
            </thead>
            <tbody>
                {items.filter(stock => !stock.isCash)
                    .map(stock => (
                        <tr key={stock.id}>
                            <td>{stock.symbol}</td>
                            <td>{stock.name}</td>
                            <td>{stock.currency}</td>
                            <td>
                                <input
                                    type="number"
                                    value={stock.price}
                                    step="0.01"
                                    onChange={(e) => onChange(stock.id, e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
        <button onClick={onConfirm} style={{ marginTop: '10px' }}>
            Confirm Update
        </button>
    </div>
);

export default PriceUpdateTable;