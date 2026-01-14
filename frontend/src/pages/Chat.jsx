import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import SubjectSelector from '../components/SubjectSelector';
import StudyPlanGenerator from '../components/StudyPlanGenerator';
import Footer from '../components/Footer';
import { chatAPI } from '../services/api';
import schoolImage from '../assets/school.jpg';
import collegeImage from '../assets/college.jpg';
import './Chat.css';

function Chat({ user, setUser }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [subject, setSubject] = useState(null);
    const [showStudyPlan, setShowStudyPlan] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const response = await chatAPI.getHistory();
            setConversations(response.data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };

    const loadConversation = async (id) => {
        try {
            const response = await chatAPI.getConversation(id);
            setCurrentConversation(id);
            setMessages(response.data.messages);
            setSubject(response.data.subject);
        } catch (error) {
            console.error('Failed to load conversation:', error);
        }
    };

    const handleNewChat = () => {
        setCurrentConversation(null);
        setMessages([]);
        setSubject(null);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message to UI
        const newMessage = { role: 'user', content: userMessage, created_at: new Date() };
        setMessages(prev => [...prev, newMessage]);
        setLoading(true);

        try {
            const response = await chatAPI.sendMessage({
                message: userMessage,
                conversationId: currentConversation,
                subject
            });

            // Add AI response to UI
            const aiMessage = {
                role: 'assistant',
                content: response.data.message,
                created_at: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);

            // Set conversation ID if new
            if (!currentConversation) {
                setCurrentConversation(response.data.conversationId);
                loadConversations();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
                    created_at: new Date()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const handleDeleteConversation = async (id) => {
        try {
            await chatAPI.deleteConversation(id);
            if (currentConversation === id) {
                handleNewChat();
            }
            loadConversations();
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    return (
        <div className="chat-page">
            <Sidebar
                user={user}
                conversations={conversations}
                currentConversation={currentConversation}
                onNewChat={handleNewChat}
                onSelectConversation={loadConversation}
                onDeleteConversation={handleDeleteConversation}
                onLogout={handleLogout}
                onToggleStudyPlan={() => setShowStudyPlan(!showStudyPlan)}
            />

            <div className="chat-main">
                <div className="chat-header">
                    <h2>Study Buddy</h2>
                    <SubjectSelector subject={subject} onSelectSubject={setSubject} />
                </div>

                {showStudyPlan ? (
                    <StudyPlanGenerator onClose={() => setShowStudyPlan(false)} />
                ) : (
                    <>
                        <div className="chat-messages">
                            {messages.length === 0 ? (
                                <div className="welcome-message">
                                    <h1 className="gradient-text">Hello, {user?.name}!</h1>
                                    <p>I'm your Vikash Study Buddy. Ask me anything about:</p>
                                    <div className="suggestion-grid">
                                        <button
                                            className="suggestion-card image-card"
                                            onClick={() => setSubject('school')}
                                            style={{
                                                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${schoolImage})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        >
                                            <span>School</span>
                                            <small>Class 1-12, Homework</small>
                                        </button>
                                        <button
                                            className="suggestion-card image-card"
                                            onClick={() => setSubject('college')}
                                            style={{
                                                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${collegeImage})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        >
                                            <span>College</span>
                                            <small>Engineering, Arts, Science</small>
                                        </button>
                                        <button className="suggestion-card" onClick={() => setSubject('programming')}>
                                            <span>💻</span>
                                            <span>Programming</span>
                                            <small>Coding, Web Dev, DSA</small>
                                        </button>
                                        <button className="suggestion-card" onClick={() => setSubject('exam-prep')}>
                                            <span>📝</span>
                                            <span>Exam Prep</span>
                                            <small>JEE, NEET, UPSC, SSC</small>
                                        </button>
                                        <button className="suggestion-card" onClick={() => setSubject('general')}>
                                            <span>📚</span>
                                            <span>General</span>
                                            <small>Ask anything!</small>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <ChatMessage key={idx} message={msg} />
                                ))
                            )}
                            {loading && (
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="chat-input-container">
                            <input
                                type="text"
                                className="input chat-input"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <button type="submit" className="btn btn-primary send-btn" disabled={loading || !input.trim()}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </form>
                    </>
                )}
                <Footer />
            </div>
        </div>
    );
}

export default Chat;
