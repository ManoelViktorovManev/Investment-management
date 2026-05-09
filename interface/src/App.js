import React, { useMemo ,useEffect, useState } from 'react';
import './App.css';
import { NavbarComponent } from './NavbarComponent';

import API_BASE_URI from './EnvVar.js';
import { FirstTimeLoging } from './FirstTimeLoging.js';
import { UserComponent } from './UserComponent.js';
import { Allocation } from './Allocation.js';
import { SettingsComponent } from './SettingsComponent.js';
import { THTCComponent } from './THTCComponent.js';
import { TaxCalculator } from './TaxCalculator.js';

function App() {
    const [currentPage, setCurrentPage] = useState('');
    const [settings, setSettings] = useState([]);
    const [users,setUsers] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [rates, setRates] = useState([]);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [userTaxes, setUserTaxes] = useState([]);
    const [loading, setLoading] = useState(true);

    // NEW STATES
    const [showUpdatePrice,setShowUpdatePrice] = useState(false);
    const [missingDates, setMissingDates] = useState([]);
    const [selectedMissingDate, setSelectedMissingDate] = useState("");
    const [priceUpdateData, setPriceUpdateData] = useState([]); // editable stocks data
    const [cameFromUpdate, setCameFromUpdate] = useState(false);
    const [appMode, setAppMode] = useState("normal"); 

    async function getSettings() {
        const response = await fetch(`${API_BASE_URI}/getSettings`);
        if (response.status === 200){
            const result = await response.json();
            setSettings(result);
            
        }
    }

    async function getUsers(){
        const response = await fetch(`${API_BASE_URI}/getUsers`);
        if (response.status === 200){
            const result = await response.json();
            setUsers(result);
        }
    } 

    async function getStocks(){
        const response = await fetch(`${API_BASE_URI}/getStocks`);
        if (response.status === 200){
            const result = await response.json();
            const cleaned = result.map(s => ({
                ...s,
                price: parseFloat(s.price),  
                numberOfShares: parseFloat(s.numberOfShares) 
            }));

            setStocks(cleaned);
        }
    }

    async function getRates(){
        const response = await fetch(`${API_BASE_URI}/getExchangeRates`);
        if (response.status === 200){
            const result = await response.json();
            setRates(result);
        }
    }

    async function getTransactionsHistory(){
        const response = await fetch(`${API_BASE_URI}/getTransactions`);
        if (response.status === 200){
            const result = await response.json();
            setTransactionHistory(result);
        }
    }

    async function getTaxes(){
        const response = await fetch(`${API_BASE_URI}/getTaxes`);
        if (response.status === 200){
            const result = await response.json();
            setTaxes(result);
        }
    }

    async function getUserTaxes(){
        const response = await fetch(`${API_BASE_URI}/getUserTaxes`);
        if (response.status === 200){
            const result = await response.json();
            setUserTaxes(result);
        }
    }

    async function getDateForUpdate(){
        // console.log(stocks);
        if(showUpdatePrice==true){
            return;
        }
            
        const response = await fetch(`${API_BASE_URI}/getLastRecordedDate`);
        if (response.status === 200){
            const result = await response.json();
            if(result.datesToRecord > 0){
                setMissingDates(result.missingDates);   // store missing dates
                setSelectedMissingDate(result.missingDates[0]); // default first
                
                setPriceUpdateData(stocks); // prepare editable
                setShowUpdatePrice(true);
                setAppMode("update");
            }
        }
    }
    
    // Handle change in editable table
    function handleEditField(id, field, value) {
        setPriceUpdateData(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    }

    // SAVE handler (backend logic you implement)
    async function handleSavePriceUpdates() {
        // console.log("Updating:", {
        //     date: selectedMissingDate,
        //     stocks: priceUpdateData
        // });
        // TODO: backend call
        const response = await fetch(`${API_BASE_URI}/updateMultipleStocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                list:priceUpdateData,
                date:selectedMissingDate,
                amountOfShares: settings[0].allShares,
                currency: settings[0].defaultCurrency
            })
        });

        // Remove the processed date
        const remaining = missingDates.filter(d => d !== selectedMissingDate);

        if (remaining.length > 0) {
            setMissingDates(remaining);
            setSelectedMissingDate(remaining[0]);
        } else {
            setShowUpdatePrice(false);
            setAppMode("normal");   // ✅ FIX
        }

    }


    useEffect(() => {
        async function load() {
            await getSettings();
            await getUsers();
            await getStocks();
            await getRates();
            await getTransactionsHistory();
            await getTaxes();
            await getUserTaxes();
        }

        load();
    }, []);

    useEffect(() => {
        if(stocks.length!=0){
            // getDateForUpdate(); 
        }
        setLoading(false);
    }, [stocks])

    const data = useMemo(() => ({
        users, settings, stocks, rates, transactionHistory, taxes, userTaxes
    }), [users, settings, stocks, rates, transactionHistory, taxes, userTaxes]);

    const refreshMethods = {
        refreshUsers: getUsers,
        refreshSettings: getSettings,
        refreshStocks: getStocks,
        refreshRates: getRates,
        refreshTransactionHistory: getTransactionsHistory,
        refreshTaxes: getTaxes,
        refreshUserTaxes: getUserTaxes,
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <p className="text-xl font-semibold text-gray-700">Loading...</p>
            </div>
        );
    }

    // ===========================
    //  NEW UPDATE PRICE SCREEN
    // ===========================
    if (showUpdatePrice) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 flex-col p-4">
                <h2 className="text-2xl font-bold mb-3">Update Prices for Missing Days</h2>

                <label className="mb-2">Select Date:</label>
                <select
                    value={selectedMissingDate}
                    onChange={e => setSelectedMissingDate(e.target.value)}
                    className="border p-2 mb-4"
                >
                    {missingDates.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <button
                className="mt-4 p-2 bg-green-600 text-white rounded"
                onClick={() => {
                    setCameFromUpdate(true);
                    setShowUpdatePrice(false);
                    setCurrentPage('settings');
                }}
                >
                Edit exchange rates
                </button>

                <button
                className="mt-4 p-2 bg-green-600 text-white rounded"
                onClick={() => {
                    setCameFromUpdate(true);
                    setShowUpdatePrice(false);
                    setCurrentPage('users');
                }}
                >
                Edit User shares
                </button>

                <table className="border-collapse border border-gray-500">
                    <thead>
                        <tr>
                            <th className="border p-2">Stock</th>
                            <th className="border p-2">Price</th>
                            <th className="border p-2">Shares</th>
                        </tr>
                    </thead>
                    <tbody>
                        {priceUpdateData.map(item => (
                            <tr key={item.id}>
                                <td className="border p-2">{item.name}</td>
                                <td className="border p-2">
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={e => handleEditField(item.id, "price", e.target.value)}
                                        className="border p-1 w-24"
                                    />
                                </td>
                                <td className="border p-2">

                                    <input
                                        type="number"
                                        value={item.numberOfShares}
                                        onChange={e => handleEditField(item.id, "numberOfShares", e.target.value)}
                                        className="border p-1 w-24"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button
                    className="mt-4 p-2 bg-green-600 text-white rounded"
                    onClick={handleSavePriceUpdates}
                >
                    SAVE & CONTINUE
                </button>

                <button
                className="mt-2 p-2 bg-gray-400 text-black rounded"
                onClick={() => {
                    setShowUpdatePrice(false);
                    setAppMode("normal");   // ✅ FIX
                    setCameFromUpdate(false);
                }}
                >
                CANCEL
                </button>

            </div>
        );
    }

    // ===========================
    // NORMAL APP RENDER
    // ===========================
    return (
        <div className="flex min-h-screen bg-gray-100">
            {Object.keys(settings).length === 0 ? (
                <FirstTimeLoging onSetupComplete={getSettings} />
            ) : (
                <div>
                    <NavbarComponent
                    setCurrentPage={setCurrentPage}
                    appMode={appMode}
                    />

                    <main className="ml-[200px] flex-grow p-10">
                        {currentPage === '' && (
                            <div className="text-center mt-32">
                                <h1 className="text-5xl font-bold mb-6">Welcome to the Portfolio Dashboard</h1>
                                <p className="text-xl text-gray-700">Select a page from the sidebar to get started.</p>
                            </div>
                        )}
                        
                       {currentPage === 'users' && (
                        <UserComponent
                            data={data}
                            refreshMethods={refreshMethods}
                            cameFromUpdate={cameFromUpdate}
                            onBackToUpdate={() => {
                            setShowUpdatePrice(true);
                            setCurrentPage('');
                            }}
                        />
                        )}

                        {currentPage === 'settings' && (
                        <SettingsComponent
                            data={data}
                            refreshMethods={refreshMethods}
                            cameFromUpdate={cameFromUpdate}
                            onBackToUpdate={() => {
                            setShowUpdatePrice(true);
                            setCurrentPage('');
                            }}
                        />
                        )}

                        {appMode === "normal" && currentPage === 'allocation' && (
                        <Allocation data={data} refreshMethods={refreshMethods} />
                        )}

                        {appMode === "normal" && currentPage === 'thtc' && (
                        <THTCComponent data={data} refreshMethods={refreshMethods} />
                        )}

                        {appMode === "normal" && currentPage === 'tax_calculator' && (
                        <TaxCalculator data={data} />
                        )}

                    </main>
                </div>
            )}
        </div>
    );
}

export default App;
