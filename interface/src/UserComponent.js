import React, { useState, useEffect } from 'react';
import API_BASE_URI from './EnvVar.js';

const UserComponent = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        showAllUsers();
        // Initialization if needed
    }, []);

    async function addNewUser() {

        const response = await fetch(`${API_BASE_URI}/createNewUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "name": userName })
        });
        if (response.status != 200) {
            alert("Problem trying to create a new User");
        }
        showAllUsers();
    }

    async function removeUser(id) {
        const response = await fetch(`${API_BASE_URI}/deleteUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "id": id })
        });
        if (response.status != 200) {
            alert("Problem trying to delete an User");
        }
        showAllUsers();
    }

    async function showAllUsers() {
        const response = await fetch(`${API_BASE_URI}/getAllUsers`, {
            method: 'GET'
        });
        if (response.status != 200) {
            alert("Problem trying to get all Users");
        }
        else {
            const data = await response.json();
            setUsers(data);
        }
    }

    return (
        <div>
            <h1>User manipulation</h1>

            <button onClick={() => setShowModal(true)}>Add User</button>

            <ul style={{ marginTop: '20px' }}>
                {users.map((user) => (
                    <li key={user.id} style={{ marginBottom: '10px' }}>
                        <strong>Name:</strong> {user.name} <br />
                        <button onClick={() => removeUser(user.id)} style={{ marginTop: '5px' }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    backgroundColor: 'white',
                    border: '1px solid black',
                    borderRadius: '8px',
                    zIndex: 1000
                }}>
                    <h3>New User</h3>
                    <input
                        type="text"
                        placeholder="User Name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        style={{ display: 'block', marginBottom: '10px' }}
                    />
                    <button onClick={addNewUser}>Submit</button>
                    <button onClick={() => setShowModal(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                </div>
            )}
        </div>
    );
}
export { UserComponent };