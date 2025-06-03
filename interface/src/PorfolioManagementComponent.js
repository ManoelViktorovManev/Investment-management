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
        const response = await fetch(`${API_BASE_URI}/asdf`);
        const text = await response.text(); // get plain text
        setAsdfName(text);
        console.log(text);
    }
    function removeAnPortfolio() {

    }
    function showAllPortfolios() {

    }
    return (
        <div>

            <h1>NISAAAN</h1>
            <p1>{asdfName}</p1>
        </div>
    );
}


export { PorfolioComponent };