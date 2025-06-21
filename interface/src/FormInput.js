import React, { useState, useEffect } from 'react';
const FormInput = ({ onSubmit, onChange, stock, title }) => (
    <form onSubmit={onSubmit} style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
        <h4>{title}</h4>
        {['name', 'symbol', 'currency', 'price', 'quantity', 'transactionDate']
            .filter(field => {
                // Remove name, symbol, and price when isStock is false
                if (!stock.isStock && ['name', 'symbol', 'price'].includes(field)) {
                    return false;
                }
                return true;
            })
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
        {/* Checkbox for "Is Cash?" */}
        <div>
            <label>
                Is Stock? (not marked means Cash):
                <input
                    type="checkbox"
                    name="isStock"
                    onChange={onChange}
                />
            </label>
        </div>
        <button type="submit">Submit</button>
    </form>
);

export default FormInput;