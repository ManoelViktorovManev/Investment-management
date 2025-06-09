import React from 'react';
import API_BASE_URI from './EnvVar.js';
const PorfolioComponent = () => {
    // we should add an add button and remove button of portfolios
    const [asdfName, setAsdfName] = React.useState("");
    React.useEffect(() => {
        // console.log("niba");
        addNewPortfolio();
    }, []);

    async function addNewPortfolio() {
        const response = await fetch(`${API_BASE_URI}/addPorfolio`);
        const text = await response.text(); // get plain text
        setAsdfName(text);
    }
    function removeAnPortfolio() {

    }
    function showAllPortfolios() {

    }
    return (
        <div>

            <h1>NISAAAN</h1>
            <p1>{asdfName}</p1>
            <button onclick="addNewPortfolio()">Click Me!</button> 
        </div>
    );
}


export { PorfolioComponent };