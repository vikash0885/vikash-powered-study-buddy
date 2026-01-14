import { marked } from 'marked';
import './ChatMessage.css';

function ChatMessage({ message, user }) {
    const isUser = message.role === 'user';

    const formatContent = (content) => {
        if (isUser) return content;

        // Convert markdown to HTML
        const html = marked(content);
        return { __html: html };
    };

    return (
        <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
            <div className="message-avatar">
                {isUser ? (
                    user?.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                    ) : (
                        <div className="avatar-text">{user?.name?.charAt(0).toUpperCase()}</div>
                    )
                ) : (
                    '🤖'
                )}
            </div>
            <div className="message-content">
                {isUser ? (
                    <p>{message.content}</p>
                ) : (
                    <div
                        className="markdown-content"
                        dangerouslySetInnerHTML={formatContent(message.content)}
                    />
                )}
            </div>
        </div>
    );
}

export default ChatMessage;
