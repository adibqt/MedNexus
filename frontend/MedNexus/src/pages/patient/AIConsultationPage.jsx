import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Activity,
  Heart,
  Stethoscope,
  Phone,
  Calendar,
  Lightbulb,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import apiService from '../../services/api';
import './AIConsultationPage.css';

const API_URL = 'http://localhost:8000';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_URL}${url}`;
};

const AIConsultationPage = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide at least 10 characters describing your symptoms.');
      return;
    }

    setError('');
    setLoading(true);
    setResults(null);

    try {
      const response = await apiService.aiDoctorConsultation({
        description: description.trim(),
      });
      setResults(response);
    } catch (err) {
      console.error('AI consultation error:', err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          'Failed to analyze symptoms. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };

  const handleNewConsultation = () => {
    setResults(null);
    setDescription('');
    setError('');
  };

  const getSeverityClass = (severity) => {
    const map = {
      low: 'ai-severity-low',
      moderate: 'ai-severity-moderate',
      high: 'ai-severity-high',
    };
    return map[severity?.toLowerCase()] || 'ai-severity-moderate';
  };

  const getMatchClass = (percentage) => {
    if (percentage >= 80) return 'match-high';
    if (percentage >= 50) return 'match-medium';
    return 'match-low';
  };

  const getMatchBadgeClass = (percentage) => {
    if (percentage >= 80) return 'ai-match-high';
    if (percentage >= 50) return 'ai-match-medium';
    return 'ai-match-low';
  };

  return (
    <div className="ai-consultation-page">
      {/* Animated background orbs */}
      <div className="ai-orb ai-orb-1" />
      <div className="ai-orb ai-orb-2" />
      <div className="ai-orb ai-orb-3" />

      <div className="ai-consultation-container">
        {/* Header */}
        <header className="ai-header">
          <button className="ai-back-btn" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>

          <div className="ai-header-title">
            <div className="ai-logo">
              <Bot />
            </div>
            <div className="ai-header-text">
              <h1>AI Health Assistant</h1>
              <p>Describe your symptoms and get personalized doctor recommendations</p>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="ai-main-grid">
          {/* Left Panel - Input Section */}
          <div className="ai-glass-card ai-input-section">
            <div className="ai-section-header">
              <div className="ai-section-icon">
                <MessageSquare />
              </div>
              <div>
                <h2 className="ai-section-title">Describe Your Symptoms</h2>
                <p className="ai-section-subtitle">Tell us how you're feeling today</p>
              </div>
            </div>

            <div className="ai-textarea-wrapper">
              <textarea
                className="ai-textarea"
                placeholder="Example: I've been experiencing severe headaches for the past 3 days, along with fever and body aches. The pain is mostly on the right side of my head and gets worse in bright light. I also feel nauseous sometimes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                maxLength={2000}
              />
              <div className="ai-char-count">{description.length}/2000 characters</div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
                color: '#f87171',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <button
              className="ai-analyze-btn"
              onClick={handleAnalyze}
              disabled={loading || !description.trim()}
            >
              <Sparkles size={20} />
              {loading ? 'Analyzing Your Symptoms...' : 'Analyze & Find Doctors'}
            </button>
          </div>

          {/* Right Panel - Results Section */}
          <div className="ai-glass-card ai-results-section">
            {/* Loading State */}
            {loading && (
              <div className="ai-loading-state">
                <div className="ai-loading-animation">
                  <div className="ai-loading-ring" />
                  <div className="ai-loading-ring" />
                  <div className="ai-loading-ring" />
                  <div className="ai-loading-center">
                    <Bot />
                  </div>
                </div>
                <p className="ai-loading-text">Analyzing your symptoms...</p>
                <p className="ai-loading-subtext">Our AI is finding the best doctors for you</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !results && (
              <div className="ai-empty-state">
                <div className="ai-empty-icon">
                  <Stethoscope />
                </div>
                <h3 className="ai-empty-title">Ready to Help You</h3>
                <p className="ai-empty-text">
                  Describe your symptoms in detail on the left, and our AI will analyze them
                  to recommend the most suitable doctors for your needs.
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && results && (
              <>
                {/* Emergency Warning */}
                {results.emergency_warning && (
                  <div className="ai-emergency-banner">
                    <div className="ai-emergency-icon">
                      <AlertTriangle />
                    </div>
                    <div className="ai-emergency-content">
                      <h3>⚠️ Seek Immediate Medical Attention</h3>
                      <p>
                        Based on your symptoms, we strongly recommend visiting the nearest
                        emergency facility immediately.
                      </p>
                    </div>
                  </div>
                )}

                {/* Severity & Confidence */}
                <div className="ai-severity-container">
                  <div className={`ai-severity-badge ${getSeverityClass(results.severity)}`}>
                    <Activity size={16} />
                    Severity: {results.severity?.toUpperCase()}
                  </div>
                  <div className="ai-confidence-badge">
                    <TrendingUp size={14} />
                    Confidence: {results.confidence?.toUpperCase()}
                  </div>
                </div>

                {/* Detected Symptoms */}
                {results.detected_symptoms?.length > 0 && (
                  <div className="ai-result-card">
                    <div className="ai-result-card-header">
                      <div className="ai-result-card-icon">
                        <Heart />
                      </div>
                      <h3 className="ai-result-card-title">Detected Symptoms</h3>
                    </div>
                    <div className="ai-symptoms-grid">
                      {results.detected_symptoms.map((symptom, idx) => (
                        <span key={idx} className="ai-symptom-tag">{symptom}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                {results.symptom_analysis && (
                  <div className="ai-result-card">
                    <div className="ai-result-card-header">
                      <div className="ai-result-card-icon">
                        <Sparkles />
                      </div>
                      <h3 className="ai-result-card-title">AI Analysis</h3>
                    </div>
                    <p className="ai-analysis-text">{results.symptom_analysis}</p>
                  </div>
                )}

                {/* Recommended Specializations with Match % */}
                {results.recommended_specializations?.length > 0 && (
                  <div className="ai-result-card">
                    <div className="ai-result-card-header">
                      <div className="ai-result-card-icon">
                        <Stethoscope />
                      </div>
                      <h3 className="ai-result-card-title">Recommended Specialists</h3>
                    </div>
                    <div className="ai-spec-list">
                      {results.recommended_specializations.map((spec, idx) => (
                        <div key={idx} className="ai-spec-item">
                          <div className="ai-spec-info">
                            <div className="ai-spec-icon">
                              <Stethoscope />
                            </div>
                            <div>
                              <div className="ai-spec-name">{spec.name}</div>
                              {spec.reason && (
                                <div className="ai-spec-reason">{spec.reason}</div>
                              )}
                            </div>
                          </div>
                          <div className={`ai-match-badge ${getMatchBadgeClass(spec.match_percentage)}`}>
                            {spec.match_percentage}% Match
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Doctors */}
                {results.has_matching_doctors ? (
                  <div className="ai-result-card">
                    <div className="ai-doctors-header">
                      <div className="ai-result-card-header" style={{ marginBottom: 0 }}>
                        <div className="ai-result-card-icon">
                          <Stethoscope />
                        </div>
                        <h3 className="ai-result-card-title">Available Doctors</h3>
                      </div>
                      <span className="ai-doctors-count">
                        {results.suggested_doctors.length} doctor(s) found
                      </span>
                    </div>
                    <div className="ai-doctors-grid">
                      {results.suggested_doctors.map((doctor) => (
                        <div key={doctor.id} className="ai-doctor-card">
                          <div className={`ai-doctor-match-ribbon ${getMatchClass(doctor.match_percentage)}`}>
                            {doctor.match_percentage}% Match
                          </div>
                          <div className="ai-doctor-header">
                            {doctor.profile_picture ? (
                              <div className="ai-doctor-avatar">
                                <img src={getImageUrl(doctor.profile_picture)} alt={doctor.name} />
                              </div>
                            ) : (
                              <div className="ai-doctor-avatar">
                                {doctor.name?.charAt(0) || 'D'}
                              </div>
                            )}
                            <div className="ai-doctor-info">
                              <h4>Dr. {doctor.name}</h4>
                              <div className="ai-doctor-specialization">
                                <Stethoscope size={14} />
                                {doctor.specialization}
                              </div>
                            </div>
                          </div>
                          {doctor.match_reason && (
                            <div className="ai-doctor-match-reason">
                              💡 {doctor.match_reason}
                            </div>
                          )}
                          <div className="ai-doctor-contact">
                            <Phone size={14} />
                            {doctor.phone}
                          </div>
                          <button
                            className="ai-book-btn"
                            onClick={() => handleBookAppointment(doctor.id)}
                          >
                            <Calendar size={16} />
                            Book Appointment
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ai-no-doctors">
                    <div className="ai-no-doctors-icon">
                      <AlertTriangle />
                    </div>
                    <div className="ai-no-doctors-content">
                      <h4>No Matching Doctors Available</h4>
                      <p>
                        We couldn't find doctors in our database matching your symptoms.
                        Please try contacting a general practitioner or visit a nearby
                        hospital for consultation.
                      </p>
                    </div>
                  </div>
                )}

                {/* Health Advice */}
                {results.health_advice && (
                  <div className="ai-advice-card">
                    <div className="ai-advice-header">
                      <div className="ai-advice-icon">
                        <Lightbulb />
                      </div>
                      <h3 className="ai-advice-title">Health Advice</h3>
                    </div>
                    <p className="ai-advice-text">{results.health_advice}</p>
                  </div>
                )}

                {/* Additional Notes */}
                {results.additional_notes && (
                  <div className="ai-result-card">
                    <div className="ai-result-card-header">
                      <div className="ai-result-card-icon">
                        <AlertTriangle />
                      </div>
                      <h3 className="ai-result-card-title">Important Notes</h3>
                    </div>
                    <p className="ai-analysis-text">{results.additional_notes}</p>
                  </div>
                )}

                {/* New Consultation Button */}
                <button className="ai-new-consultation-btn" onClick={handleNewConsultation}>
                  <RefreshCw size={18} />
                  Start New Consultation
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConsultationPage;
