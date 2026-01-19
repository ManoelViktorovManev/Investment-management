import React, { useMemo ,useEffect, useState } from 'react';
import './App.css';
import { NavbarComponent } from './NavbarComponent';

import API_BASE_URI from './EnvVar.js';
import { FirstTimeLoging } from './FirstTimeLoging.js';
import { UserComponent } from './UserComponent.js';
import { Allocation } from './Allocation.js';
import { SettingsComponent } from './SettingsComponent.js';
import { THTCComponent } from './THTCComponent.js';


function App() {

    /*
    TODO:
        6. After sell of stock => taxes, commision and others STATUS: Done 90%

    NEXT TASKS:
        1. Automated Market and Currency Data Fetch => from yahoofinance, 
        Bulgarian API, and currecny api to take the data at the end of the day and input it.
        2. End-of-Day Performance Tracking => Tracking the share price historoicaly and have
        line chart showing overtime what happend.
        3. Adding a new assets - loan
        4. Email/ exporting pdf data => showing for every weak what happened to the price +
        what are top movers for the weak. (3 best and 3 worst)
    */

    const [currentPage, setCurrentPage] = useState('');
    const [settings, setSettings] = useState([]);
    const [users,setUsers]=useState([]);
    const [stocks, setStocks] = useState([]);
    const [rates, setRates] = useState([]);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [userTaxes, setUserTaxes] = useState([]);
    const [loading, setLoading] = useState(true);

    async function getSettings() {
        const response = await fetch(`${API_BASE_URI}/getSettings`, {
        });
        if (response.status==200){
            const result = await response.json();
            setSettings(result);
            setLoading(false);
        }
        
    } 
    async function getUsers(){
        const response = await fetch(`${API_BASE_URI}/getUsers`, {
        });
        if (response.status==200){
            const result = await response.json();
            setUsers(result);
        }
    } 
    async function getStocks(){
        const response = await fetch(`${API_BASE_URI}/getStocks`, {
        });
        if (response.status==200){
            const result = await response.json();
            setStocks(result);
        }
    }
    async function getRates(){
        const response = await fetch(`${API_BASE_URI}/getExchangeRates`, {
        });
        if (response.status==200){
            const result = await response.json();
            setRates(result);
        }
    }
    async function getTransactionsHistory(){
        const response = await fetch(`${API_BASE_URI}/getTransactions`, {
        });
        if (response.status==200){
            const result = await response.json();
            setTransactionHistory(result);
        }
    }
    async function getTaxes(){
        const response = await fetch(`${API_BASE_URI}/getTaxes`, {
        });
        if (response.status==200){
            const result = await response.json();
            setTaxes(result);
        }
    } 
    
    async function getUserTaxes(){
        const response = await fetch(`${API_BASE_URI}/getUserTaxes`, {
        });
        if (response.status==200){
            const result = await response.json();
            setUserTaxes(result);
        }
    }  
    useEffect(() => {
        getSettings();
        getUsers();
        getStocks();
        getRates();
        getTransactionsHistory();
        getTaxes();
        getUserTaxes();
    }, []);

    const data = useMemo(() => ({
        users,
        settings,
        stocks,
        rates,
        transactionHistory,
        taxes,
        userTaxes,
    }), [users, settings,stocks,rates,transactionHistory,taxes,userTaxes]);
    const refreshMethods = {
        refreshUsers: getUsers,
        refreshSettings: getSettings,
        refreshStocks: getStocks,
        refreshRates:getRates,
        refreshTransactionHistory: getTransactionsHistory,
        refreshTaxes: getTaxes,
        refreshUserTaxes: getUserTaxes,
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <p className="text-xl font-semibold text-gray-700">
                Loading...
            </p>
            </div>
        );
    }
// Maybe all perfomrmance can be done here
     return (
    <div className="flex min-h-screen bg-gray-100">
        {Object.keys(settings).length === 0 ?(
            <FirstTimeLoging onSetupComplete={getSettings} />
        ):(
            <div>
             <NavbarComponent
                setCurrentPage={setCurrentPage}
                />

                <main className="ml-[200px] flex-grow p-10">
                    {currentPage === '' && (
                    <div className="text-center mt-32">
                        <h1 className="text-5xl font-bold mb-6">Welcome to the Portfolio Dashboard</h1>
                        <p className="text-xl text-gray-700">Select a page from the sidebar to get started.</p>
                    </div>
                    )}
                    {currentPage === 'users' && (
                    <UserComponent data={data} refreshMethods={refreshMethods} />
                    )}
                    {currentPage === 'allocation' && (
                    <Allocation data={data} refreshMethods={refreshMethods} />
                    )}
                    {currentPage === 'settings' && (
                    <SettingsComponent data={data} refreshMethods={refreshMethods} />
                    )}
                    {currentPage === 'thtc' && (
                    <THTCComponent data={data} refreshMethods={refreshMethods} />
                    )}
                </main>
            </div>
        )}
     
    </div>
  );
}
export default App;