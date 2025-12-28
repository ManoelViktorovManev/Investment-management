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
                defaultCurrency: "EUR",
                sharePrice: 0.79118
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
    // Call them all once at start
    useEffect(() => {
        checkSettings();
        // createUser();
    }, []);

    useEffect(() => {
        if(isForFirstTime==true){
            createSettings();
        }
    }, [isForFirstTime]);
   

    return ( 
    <div className = "flex min-h-screen bg-gray-100" >
        <p> PATKA GOLEMA </p> 
       {isForFirstTime == true &&(
        <div className="text-center mt-32">
            <h1 className="text-5xl font-bold mb-6">This is first time</h1>
          </div>
       )}
        </div >
    );
}
export default App;