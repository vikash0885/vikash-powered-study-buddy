import { useState, useEffect } from 'react';
import './ProfileSettings.css';

function ProfileSettings({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        name: '',
        educationLevel: '',
        avatar: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                educationLevel: user.educationLevel || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onUpdate(formData);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-settings-overlay">
            <div className="profile-settings-modal">
                <div className="modal-header">
                    <h2>Profile Settings</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="profile-preview">
                        <div className="avatar-preview">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Profile" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {formData.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="input"
                            placeholder="Your Name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Education Level</label>
                        <select
                            value={formData.educationLevel}
                            onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                            className="input"
                        >
                            <option value="general">General Learner</option>
                            <option value="high_school">High School</option>
                            <option value="undergraduate">Undergraduate</option>
                            <option value="graduate">Graduate</option>
                            <option value="professional">Professional</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Avatar URL</label>
                        <input
                            type="url"
                            value={formData.avatar}
                            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                            className="input"
                            placeholder="https://example.com/avatar.jpg"
                        />
                        <small className="help-text">Enter a URL for your profile picture</small>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProfileSettings;
