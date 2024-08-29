import React, { useState } from 'react';
import './App.css';
import Home from './home';  // Import the new Home component

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            setIsLoggedIn(true);
            setLoginError('');
        } else {
            setLoginError('Invalid username or password');
        }
    };

    return (
        <div className="App">
            {!isLoggedIn ? (
                <div className="form-container">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
                        <button type="submit">Login</button>
                    </form>
                </div>
            ) : (
                <Home username={username} />
            )}
        </div>
    );
}

export default App;
