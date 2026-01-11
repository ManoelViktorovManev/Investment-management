import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js'; 
const UserComponent = ({ data, refreshMethods }) => {
    var users = data.users;
    var settings = data.settings;
    var share = settings[0].sharePrice; // only one instance of settings we have
    var allShares = settings[0].allShares;
    
    const [addShares,setAddShares] = useState(false);
    const [removeShares,setRemoveShares] = useState(false);


    const [editUser, setEditUser] = useState(null); // user selected for +/-
    const [editMoney, setEditMoney] = useState(0);
    const [editShares, setEditShares] = useState(0);

    const [addNewUser, setAddNewUser] = useState(false);
    // New user form state
    const [newUserName, setNewUserName] = useState('');
    const [newUserMoney, setNewUserMoney] = useState(0);
    const [newUserShares, setNewUserShares] = useState(0);

    

     async function  handleCreateUser() {
      // 🔥 HERE you will add your API call
       const response = await fetch(`${API_BASE_URI}/createUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newUserName,
                shares: Number(newUserShares).toFixed(2)
            })
        });

        if (response.status==200){
          const responseTransaction = await fetch(`${API_BASE_URI}/createTransaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                typeTransaction: "add",
                person:newUserName,
                sumChange: newUserMoney,
                changePartition: newUserShares,
                priceForPartition:share,
                newUserPartitionsNumber: newUserShares
            })
          });
          var calculation = (Number(newUserShares) + Number(allShares)).toFixed(2);
          // console.log(calculation);
          const response = await fetch(`${API_BASE_URI}/updateSettings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  allShares: calculation
              })
          });

          // Reset form
          setNewUserName('');
          setNewUserMoney(0);
          setNewUserShares(0);
          setAddNewUser(false);
          refreshMethods.refreshUsers();
          refreshMethods.refreshSettings();
          
        }
    };


    async function handleSubmitEdit(user) {
      console.log({
        user: user.name,
        id: user.id,
        mode: addShares ? "add" : "remove",
        money: editMoney,
        shares: editShares
      });

      const response = await fetch(`${API_BASE_URI}/updateUserShares`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId:user.id,
                mode:addShares ? "add" : "remove",
                updatedShares: Number(editShares)
            })
        });


      if(response.status==200){

        console.log({
          typeTransaction: addShares ? "add" : "remove",
                person: user.name,
                sumChange: editMoney,
                changePartition: editShares,
                priceForPartition:share,
                newUserPartitionsNumber: addShares ?  Number(user.shares) + Number(editShares): Number(user.shares) - Number(editShares)
        })
        const responseTransaction = await fetch(`${API_BASE_URI}/createTransaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                typeTransaction: addShares ? "add" : "remove",
                person: user.name,
                sumChange: editMoney,
                changePartition: editShares,
                priceForPartition:share,
                newUserPartitionsNumber: addShares ?  Number(user.shares) + Number(editShares): Number(user.shares) - Number(editShares)
            })
          });
        var statetoperform =  addShares ? "add" : "remove";
        var calculation = 0;
        if(statetoperform=="add"){
          calculation = (Number(editShares) + Number(allShares)).toFixed(2);
        }
        else{
          calculation= ( Number(allShares) - Number(editShares)).toFixed(2);
        }
         
          const response = await fetch(`${API_BASE_URI}/updateSettings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  allShares: calculation
              })
          });
      }
      setAddShares(false);
      setRemoveShares(false);
      setEditUser(null);
      setEditMoney(0);
      setEditShares(0);

      // Refresh parent data
      refreshMethods.refreshUsers();
      refreshMethods.refreshSettings();
    }


  return (
    <div className="overflow-x-auto">
        <button className="px-2 py-1 bg-green-500 text-white rounded mr-2"  onClick={() => setAddNewUser(true)}>
            Add a new User
        </button>


        {/* Adding or removing amount of shares/ money from the account  */}
        {(addShares || removeShares) && editUser && (
        <div className="p-4 border rounded-lg bg-gray-50 shadow space-y-3 max-w-md mt-4">
          <h3 className="text-lg font-semibold">
            {addShares ? `Add Shares to ${editUser.name}` : `Remove Shares from ${editUser.name}`}
          </h3>

          <div className="space-y-2">
            <label className="block text-sm text-gray-600">
              {addShares ? "Amount to Invest (Money)" : "Amount to Withdraw (Money)"}
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded"
              min="0"
              value={editMoney}
              onChange={(e) => {
                setEditMoney(Number(e.target.value));
                if (share !== 0) {
                  setEditShares((Number(e.target.value) / share).toFixed(5));
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-600">
              {addShares ? "Shares to Add" : "Shares to Remove"}
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded"
              min="0"
              value={editShares}
              onChange={(e) => {
                setEditShares(Number(e.target.value));
                if (share !== 0) {
                  setEditMoney((Number(e.target.value) * share).toFixed(5));
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => handleSubmitEdit(editUser)}
            >
              Confirm
            </button>

            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => {
                setAddShares(false);
                setRemoveShares(false);
                setEditUser(null);
                setEditMoney(0);
                setEditShares(0);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

             


       {addNewUser && (
        <div className="p-4 border rounded-lg bg-gray-50 shadow space-y-3 max-w-md">
          <h3 className="text-lg font-semibold">Create New User</h3>
           <label className="block text-sm text-gray-600">
              Name
            </label>
          <input
            type="text"
            placeholder="User name"
            className="w-full px-3 py-2 border rounded"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />

          <label className="block text-sm text-gray-600">
              Amout of money
            </label>
          <input
            type="number"
            placeholder="Initial amount of money"
            className="w-full px-3 py-2 border rounded"
            min="0"
            value={newUserMoney}
            onChange={(e) => {
              setNewUserMoney(Number(e.target.value))
              if(share!=0){
                setNewUserShares(parseFloat(Number(e.target.value/share)).toFixed(5))
              }
              
            } }
          />
          <label className="block text-sm text-gray-600">
              Shares to get
            </label>
          <input
            type="number"
            placeholder="Initial shares"
            className="w-full px-3 py-2 border rounded"
            min="0"
            value={newUserShares}
            onChange={(e) => {
              setNewUserShares(Number(e.target.value))
              if(share != 0){
                setNewUserMoney(parseFloat(Number(e.target.value*share)).toFixed(5))
              }
              
            }}
          />

          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleCreateUser}
            >
              Create
            </button>

            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => setAddNewUser(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <table className="min-w-full border border-gray-300 bg-white shadow rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">User</th>
            <th className="px-4 py-2 text-left">Shares</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user, index) => (
            
            <tr
              key={index}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{Math.round(user.shares)}</td>
              <td className="px-4 py-2 text-center">
       
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                  onClick={() => {
                    setEditUser(user);
                    setAddShares(true);
                    setRemoveShares(false);
                  }}
                >
                  +
                </button>

                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => {
                    setEditUser(user);
                    setRemoveShares(true);
                    setAddShares(false);
                  }}
                >
                  −
                </button>

                
              </td>
            </tr>
            
          ))}
        </tbody>
      </table>
     
    </div>
  );
};

export { UserComponent };