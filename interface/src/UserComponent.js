import React, { useState, useEffect } from 'react';

const UserComponent = ({ users }) => {
    // const []
    const [addShares,setAddShares] = useState(false);
    const [removeShares,setRemoveShares] = useState(false);
    const [amountShares, setAmountShares] = useState(0);

    const [addNewUser, setAddNewUser] = useState(false);

    // Display for adding/removing shares
    // Button for creating a new user with amount and shares to input
  return (
    <div className="overflow-x-auto">
        <button className="px-2 py-1 bg-green-500 text-white rounded mr-2"  onClick={() => setAddNewUser(true)}>
            Add a new User
        </button>
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
                <button className="px-2 py-1 bg-green-500 text-white rounded mr-2"  onClick={() => setAddShares(true)}>
                  +
                </button>
                <button className="px-2 py-1 bg-red-500 text-white rounded"  onClick={() => setRemoveShares(true)}>
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