import React, { useEffect, useState } from 'react';
import './App.css';
import { NavbarComponent } from './NavbarComponent';

import API_BASE_URI from './EnvVar.js';

function App() {

    /*
    TODO:
        1. Settings hold what is the entire value of the portfolio
        2. Option for if there is existing portfolio and option if to start from 0. (Ако е както мен, да се добави ръчно всичко.)
        2. Display of adding a new user + a new position of the user (getting money) + removing the position (returning back money)
        3. Showing as graph the total ownership (shares + value). Graph of total stock and total cash position.
        4. After buying or selling position (дял) => holding and history of transactions 
        5. After sell of stock => taxes, commision and others
    */
    const [isForFirstTime,setIsForFirstTime] = useState(false);
    const [optionExistingPortfolio, setOptionExistingPortfolio] = useState(false);
    const [optionNewPortfolio, setOptionNewPortfolio] = useState(false);
    const [doneWithSettings, setDoneWithSettings] = useState(false); 
    const [currency, setCurrency] = useState("EURO")
    const [priceForOneStake, setPriceForOneStake] = useState(0);
    
    async function checkSettings() {
        const response = await fetch(`${API_BASE_URI}/getSettings`, {
        });
        if (response.status==200){
            const result = await response.json();
            console.log(result);
            if (Object.keys(result).length === 0) {
                setIsForFirstTime(true);
            }
        }
    }

    async function createSettings() {
       const response = await fetch(`${API_BASE_URI}/updateSettings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                defaultCurrency: currency,
                sharePrice: priceForOneStake
            })
        });
    }
    async function createUser(){
        const response = await fetch(`${API_BASE_URI}/createUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "NISAN"
            })
        });
    }
    const handleChange = (event) => {
        setCurrency(event.target.value)
    }
    const handleDyalChange = (event) =>{
        setPriceForOneStake(event.target.value)
    }
    // Call them all once at start
    useEffect(() => {
        checkSettings();
        // createUser();
    }, []);

    useEffect(() => {
        if(optionExistingPortfolio==true || optionNewPortfolio==true){
            // createSettings();
            setIsForFirstTime(false);
        }
    }, [optionExistingPortfolio, optionNewPortfolio]);

     useEffect(() => {
        if(doneWithSettings==true){
            createSettings();
        }
    }, [doneWithSettings]);
   

    return ( 
    <div className = "flex min-h-screen bg-gray-100" >
        <p> PATKA GOLEMA </p> 
       {isForFirstTime == true &&(
        <div className="text-center mt-32">
            <h1 className="text-5xl font-bold mb-6">Choose what option do you want:</h1>
            <button type="button" onClick={() => setOptionExistingPortfolio(true)}>Existing Portfolio
            </button>

            <button type="button" onClick={() => {
                setOptionNewPortfolio(true)
            }}> New Portfolio
            </button>
          </div>
       )}
       {(doneWithSettings == false && isForFirstTime==false && (optionExistingPortfolio==true || optionNewPortfolio==true)) &&(
        <div className="text-center mt-32">
            <h1 className="text-5xl font-bold mb-6">Choose what currency do you use:</h1>
            <select value={currency} onChange={handleChange}>
                <option value="EUR">EURO</option>
                <option value="USD">USD</option>
            </select>
            {(optionExistingPortfolio==true) &&(
                <td>
                <label> CENA NA DYAL: </label>
                    <input
                        type='number'
                        name="dyal"
                        min='0'
                        onChange={handleDyalChange}
                    />
                </td>
            )}
            <button type="button" onClick={() => setDoneWithSettings(true)}>Done
            </button>
          </div>
       )}
        </div>
    );
}
export default App;