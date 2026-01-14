import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StudyPlanGenerator from '../components/StudyPlanGenerator';
import Footer from '../components/Footer';
import { authAPI } from '../services/api';
import './Chat.css';

function StudyPlan({ user, setUser }) {
    const [conversations, setConversations] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const handleUpdateProfile = async (data) => {
        try {
            const response = await authAPI.updateProfile(data);
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data;
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    };

    return (
        <div className="chat-page">
            <Sidebar
                user={user}
                conversations={conversations}
                currentConversation={null}
                onNewChat={() => navigate('/chat')}
                onSelectConversation={(id) => navigate('/chat')}
                onDeleteConversation={() => { }}
                onLogout={handleLogout}
                onUpdateProfile={handleUpdateProfile}
            />

            <div className="chat-main">
                <StudyPlanGenerator onClose={() => navigate('/chat')} />
                <Footer />
            </div>
        </div>
    );
}

export default StudyPlan;
