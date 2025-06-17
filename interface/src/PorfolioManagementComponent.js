import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';

const PorfolioComponent = () => {
    const [portfolios, setPortfolios] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [PortfolioName, setPortfolioName] = useState("");
    const [PortfolioCurrency, setPortfolioCurrency] = useState("");

    useEffect(() => {
        showAllPortfolios();
        // Initialization if needed
    }, []);

    async function addNewPortfolio() {

        const response = await fetch(`${API_BASE_URI}/createNewPortfolio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "name": PortfolioName, "currency": PortfolioCurrency })
        });
        if (response.status != 200) {
            alert("Problem trying to create a new Portfolio");
        }
        showAllPortfolios();
    }

    async function removePortfolio(id) {
        const response = await fetch(`${API_BASE_URI}/deletePortfolio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "id": id })
        });
        if (response.status != 200) {
            alert("Problem trying to delete an portfolio");
        }
        showAllPortfolios();
    }

    async function showAllPortfolios() {
        const response = await fetch(`${API_BASE_URI}/getAllPortfolios`, {
            method: 'GET'
        });
        if (response.status != 200) {
            alert("Problem trying to get all Portfolios");
        }
        else {
            const data = await response.json();
            setPortfolios(data);
        }
    }

    return (
        <div>
            <h1>Portfolio manipulation</h1>

            <button onClick={() => setShowModal(true)}>Add Portfolio</button>

            <ul style={{ marginTop: '20px' }}>
                {portfolios.map((portfolio) => (
                    <li key={portfolio.id} style={{ marginBottom: '10px' }}>
                        <strong>Name:</strong> {portfolio.name} <br />
                        <strong>Currency:</strong> {portfolio.currency} <br />
                        <button onClick={() => removePortfolio(portfolio.id)} style={{ marginTop: '5px' }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

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
                    <h3>New Portfolio</h3>
                    <input
                        type="text"
                        placeholder="Portfolio Name"
                        value={PortfolioName}
                        onChange={(e) => setPortfolioName(e.target.value)}
                        style={{ display: 'block', marginBottom: '10px' }}
                    />
                    <input
                        type="text"
                        placeholder="Currency"
                        value={PortfolioCurrency}
                        onChange={(e) => setPortfolioCurrency(e.target.value)}
                        style={{ display: 'block', marginBottom: '10px' }}
                    />
                    <button onClick={addNewPortfolio}>Submit</button>
                    <button onClick={() => setShowModal(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export { PorfolioComponent };