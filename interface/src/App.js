import React, { useMemo ,useEffect, useState } from 'react';
import './App.css';
import { NavbarComponent } from './NavbarComponent';

import API_BASE_URI from './EnvVar.js';
import { FirstTimeLoging } from './FirstTimeLoging.js';
import { UserComponent } from './UserComponent.js';
import { Allocation } from './Allocation.js';
import { SettingsComponent } from './SettingsComponent.js';


function App() {

    /*
    TODO:
        1. Settings hold what is the entire value of the portfolio - STATUS: DONE
        2. Option for if there is existing portfolio and option if to start from 0. (Ако е както мен, да се добави ръчно всичко.) 
            STATUS: DONE
        3. Display of adding a new user + a new position of the user (getting money) + removing the position (returning back money)
            STATUS: DONE
        4. Showing as graph the total ownership (shares + value). Graph of total stock and total cash position. STATUS: DONE
        5. After buying or selling position (дял) => holding and history of transactions STATUS: NOT STARTED
        6. After sell of stock => taxes, commision and others STATUS: NOT STARTED
    */

    const [currentPage, setCurrentPage] = useState('');
    const [settings, setSettings] = useState([]);
    const [users,setUsers]=useState([]);
    const [stocks, setStocks] = useState([]);
    const [rates, setRates] = useState([]);
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
    useEffect(() => {
        getSettings();
        getUsers();
        getStocks();
        getRates();
    }, []);

    const data = useMemo(() => ({
        users,
        settings,
        stocks,
        rates,
    }), [users, settings,stocks,rates]);
    const refreshMethods = {
        refreshUsers: getUsers,
        refreshSettings: getSettings,
        refreshStocks: getStocks,
        refreshRates:getRates,
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
                data={data}
                refreshMethods={refreshMethods}
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
                </main>
            </div>
        )}
     
    </div>
  );
}
export default App;