import { useState } from 'react';
import { studyPlanAPI } from '../services/api';
import { marked } from 'marked';
import studyPlanLogo from '../assets/studyplan_v2.png';
import './StudyPlanGenerator.css';

function StudyPlanGenerator({ onClose }) {
    const [formData, setFormData] = useState({
        subject: '',
        duration: '',
        hoursPerDay: ''
    });
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await studyPlanAPI.generate(formData);
            setPlan(response.data.plan);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to generate study plan';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({ subject: '', duration: '', hoursPerDay: '' });
        setPlan(null);
        setError('');
    };

    return (
        <div className="study-plan-container">
            <div className="study-plan-header">
                <h2>
                    <img src={studyPlanLogo} alt="Study Plan" className="header-logo" />
                    Study Plan Generator
                </h2>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            {!plan ? (
                <form onSubmit={handleSubmit} className="study-plan-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Subject / Topic</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            required
                            placeholder="e.g., Data Structures, Python Programming, Calculus"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Duration</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                required
                                placeholder="e.g., 2 weeks, 1 month"
                            />
                        </div>

                        <div className="form-group">
                            <label>Hours Per Day</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.hoursPerDay}
                                onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
                                required
                                min="1"
                                max="12"
                                placeholder="e.g., 3"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Generating Plan...' : 'Generate Study Plan'}
                    </button>
                </form>
            ) : (
                <div className="study-plan-result">
                    <div className="plan-header">
                        <div>
                            <h3>{formData.subject}</h3>
                            <p className="plan-meta">
                                Duration: {formData.duration} • {formData.hoursPerDay} hours/day
                            </p>
                        </div>
                        <button className="btn btn-secondary" onClick={handleReset}>
                            Create New Plan
                        </button>
                    </div>

                    <div
                        className="plan-content markdown-content"
                        dangerouslySetInnerHTML={{ __html: marked(plan) }}
                    />
                </div>
            )}
        </div>
    );
}

export default StudyPlanGenerator;
