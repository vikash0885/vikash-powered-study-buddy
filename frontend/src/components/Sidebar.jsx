import studyPlanIcon from '../assets/studyplan.jpg';
import './Sidebar.css';

function Sidebar({
    user,
    conversations,
    currentConversation,
    onNewChat,
    onSelectConversation,
    onDeleteConversation,
    onLogout,
    onToggleStudyPlan
}) {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3 className="gradient-text">Study Buddy</h3>
                <button className="btn btn-primary" onClick={onNewChat}>
                    + New Chat
                </button>
            </div>

            <div className="sidebar-menu">
                <button className="menu-item" onClick={onToggleStudyPlan}>
                    <img src={studyPlanIcon} alt="Study Plan" className="menu-icon" />
                    <span>Study Plan Generator</span>
                </button>
            </div>

            <div className="conversations-list">
                <h4>Recent Conversations</h4>
                {conversations.length === 0 ? (
                    <p className="empty-state">No conversations yet</p>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`conversation-item ${currentConversation === conv.id ? 'active' : ''}`}
                        >
                            <div
                                className="conversation-info"
                                onClick={() => onSelectConversation(conv.id)}
                            >
                                <div className="conversation-title">{conv.title || 'New Conversation'}</div>
                                <div className="conversation-meta">
                                    {conv.subject && <span className="subject-tag">{conv.subject}</span>}
                                    <span className="message-count">{conv.message_count} messages</span>
                                </div>
                            </div>
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConversation(conv.id);
                                }}
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    <div className="user-details">
                        <div className="user-name">{user?.name}</div>
                        <div className="user-education">{user?.educationLevel}</div>
                    </div>
                </div>
                <button className="btn btn-ghost logout-btn" onClick={onLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
