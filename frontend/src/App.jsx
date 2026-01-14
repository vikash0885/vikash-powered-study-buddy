import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import StudyPlan from './pages/StudyPlan';
import ChatWidget from './components/ChatWidget';
import './index.css';

function App() {
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Load user from localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        // Load theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={user ? <Navigate to="/chat" /> : <Login setUser={setUser} />}
                />
                <Route
                    path="/register"
                    element={user ? <Navigate to="/chat" /> : <Register setUser={setUser} />}
                />
                <Route
                    path="/chat"
                    element={user ? <Chat user={user} setUser={setUser} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/study-plan"
                    element={user ? <StudyPlan user={user} setUser={setUser} /> : <Navigate to="/login" />}
                />
                <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
            </Routes>
            {user && <ChatWidget />}
        </BrowserRouter>
    );
}

export default App;
