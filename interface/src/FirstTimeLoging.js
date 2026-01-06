import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';

const FirstTimeLoging = ({onSetupComplete}) => {
    const [isForFirstTime,setIsForFirstTime] = useState(true);
    const [optionExistingPortfolio, setOptionExistingPortfolio] = useState(false);
    const [optionNewPortfolio, setOptionNewPortfolio] = useState(false);
    const [doneWithSettings, setDoneWithSettings] = useState(false); 
    const [currency, setCurrency] = useState("EURO")
    const [priceForOneStake, setPriceForOneStake] = useState(0);
    const [allShares, setAllShares] = useState(0);

    const [userName, setUserName] = useState("");
    const [userShares, setUserShare] = useState(0);
    const [arrayUsers,setArrayUsers] = useState([]);

    async function createSettings() {
       const response = await fetch(`${API_BASE_URI}/updateSettings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                defaultCurrency: currency,
                sharePrice: priceForOneStake,
                allShares:allShares
            })
        });
    }
    async function createUser(){
        
        const response = await fetch(`${API_BASE_URI}/createUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                list: arrayUsers 
            })
        });
    }
    function rememberUserData(){
        setArrayUsers([...arrayUsers, {name:userName, shares:userShares}]);
        setAllShares(Number(allShares)+Number(userShares));
    }
    const handleChange = (event) => {
        setCurrency(event.target.value)
    }
    const handleDyalChange = (event) =>{
        setPriceForOneStake(event.target.value)
    }
    const handleUserNameChange = (event) =>{
        setUserName(event.target.value)
    }
    const handleUserSharesChange = (event) =>{
        setUserShare(event.target.value)
    } 

    useEffect(() => {
        if(optionExistingPortfolio==true || optionNewPortfolio==true){
            setIsForFirstTime(false);
        }
    }, [optionExistingPortfolio, optionNewPortfolio]);
    
    useEffect(() => {
        const finalizeSetup = async () => {
            if (!doneWithSettings) return;

            await createSettings();

            if (optionExistingPortfolio) {
                await createUser();
            }

            // ✅ Fetch AFTER DB is updated
            await onSetupComplete();
        };

    finalizeSetup();
    }, [doneWithSettings]);
   return ( 
    <div className = "flex min-h-screen bg-gray-100" >
        <p> PATKA GOLEMA 8===========================D - - - </p> 
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
                
                <div>
                <label> CENA NA DYAL: </label>
                    <input
                        type='number'
                        name="dyal"
                        min='0'
                        onChange={handleDyalChange}
                    />
                     <label>User name: </label>
                    <input
                        type='text'
                        value={userName}
                        name="user_name"
                        onChange={handleUserNameChange}
                    />
                    <label>User shares: </label>
                    <input
                        type='number'
                        name="user_shares"
                        value={userShares}
                        min="0"
                        onChange={handleUserSharesChange}
                    />
                    <button type="button" onClick={() => {
                        rememberUserData()
                        setUserName("");
                        setUserShare(0);
                    }}> Add user
                    </button>
                </div>
                // Adding user => User name + number of shares they have
            )}
            <button type="button" onClick={() => setDoneWithSettings(true)}>Done
            </button>
          </div>
       )}
        </div>
    );

};
export { FirstTimeLoging };