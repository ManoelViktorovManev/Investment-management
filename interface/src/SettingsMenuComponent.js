import React, { useState } from 'react';
import API_BASE_URI from './EnvVar.js';

const SettingsMenuComponent = ({ users, reloadUsers }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [userName, setUserName] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUserName, setEditedUserName] = useState('');

  async function addNewUser() {
    if (!userName.trim()) return alert("User name cannot be empty");
    const response = await fetch(`${API_BASE_URI}/createNewUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName })
    });
    if (response.status !== 200) {
      alert("Problem trying to create a new user");
      return;
    }
    setUserName('');
    reloadUsers();
  }

  async function removeUser(id) {
    const response = await fetch(`${API_BASE_URI}/deleteUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (response.status !== 200) {
      alert("Problem trying to delete the user");
      return;
    }
    reloadUsers();
  }

  async function updateUser(id) {
    if (!editedUserName.trim()) return alert("User name cannot be empty");
    const response = await fetch(`${API_BASE_URI}/editUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: editedUserName })
    });
    if (response.status !== 200) {
      alert("Problem updating user");
      return;
    }
    setEditingUserId(null);
    setEditedUserName('');
    reloadUsers();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="space-x-4 mb-6">
        {['user', 'portfolio', 'stock'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-md ${activeSection === section ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)} Settings
          </button>
        ))}
      </div>

      {activeSection === 'user' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">User Settings</h2>
          <p className="mb-4">Here you can add, edit or remove users.</p>

          <div className="flex gap-2 mb-4">
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="New user name"
              className="border px-3 py-1 flex-1"
            />
            <button onClick={addNewUser} className="bg-green-500 text-white px-4 py-1 rounded">
              Create User
            </button>
          </div>

          <ul className="space-y-3">
            {users.map((user) => (
              <li key={user.id} className="border p-3 rounded flex items-center justify-between">
                {editingUserId === user.id ? (
                  <>
                    <input
                      className="border px-2 py-1 mr-2"
                      value={editedUserName}
                      onChange={(e) => setEditedUserName(e.target.value)}
                    />
                    <div className="space-x-2">
                      <button onClick={() => updateUser(user.id)} className="bg-blue-500 text-white px-2 py-1 rounded">
                        Save
                      </button>
                      <button onClick={() => setEditingUserId(null)} className="text-red-500">
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-medium">{user.name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditedUserName(user.name);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button onClick={() => removeUser(user.id)} className="text-red-600">
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeSection === 'portfolio' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Portfolio Settings</h2>
          <p>Manage available portfolios, symbols, or stock limits here.</p>
          <input
            placeholder="Portfolio Name"
            className="border px-3 py-1 mt-2 w-full"
          />
          <button className="mt-2 px-4 py-1 bg-green-500 text-white rounded">
            Add Portfolio
          </button>
        </div>
      )}
    </div>
  );
};

export { SettingsMenuComponent };