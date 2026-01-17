import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Bot,
  Sparkles,
  AlertTriangle,
  Activity,
  Stethoscope,
  Heart,
  Phone,
  Calendar,
  Lightbulb,
} from 'lucide-react';
import apiService from '../../services/api';
import './AIDoctorConsultation.css';

const API_URL = 'http://localhost:8000';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_URL}${url}`;
};

const AIDoctorConsultation = ({ onClose }) => {
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
          'Failed to analyze symptoms. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/patient/book-appointment?doctor=${doctorId}`);
    onClose();
  };

  const getSeverityClass = (severity) => {
    const severityMap = {
      low: 'severity-low',
      moderate: 'severity-moderate',
      high: 'severity-high',
    };
    return severityMap[severity?.toLowerCase()] || 'severity-moderate';
  };

  const getConfidenceStars = (confidence) => {
    const confidenceMap = {
      low: 1,
      medium: 2,
      high: 3,
    };
    const stars = confidenceMap[confidence?.toLowerCase()] || 2;
    return '⭐'.repeat(stars);
  };

  return (
    <div className="ai-doctor-modal" onClick={onClose}>
      <div
        className="ai-doctor-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ai-doctor-header">
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
          <div className="ai-doctor-header-content">
            <div className="ai-icon-wrapper">
              <Bot />
            </div>
            <div className="ai-doctor-title">
              <h2>AI Doctor Assistant</h2>
              <p>Describe your symptoms and get doctor recommendations</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="ai-doctor-body">
          {/* Input Section */}
          {!results && (
            <div className="input-section">
              <label htmlFor="symptoms" className="input-label">
                <Sparkles size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Tell us how you're feeling
              </label>
              <textarea
                id="symptoms"
                className="symptom-textarea"
                placeholder="Example: I've been experiencing severe headaches for the past 3 days, along with fever and body aches. The pain is mostly on the right side of my head and gets worse in bright light..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
              <p className="input-helper">
                Please describe your symptoms in detail including duration, severity, and any other relevant information.
              </p>
              {error && (
                <div className="error-message" style={{ 
                  color: '#dc2626', 
                  marginTop: '12px', 
                  fontSize: '14px',
                  padding: '12px',
                  background: '#fee2e2',
                  borderRadius: '8px'
                }}>
                  {error}
                </div>
              )}
              <div className="action-buttons">
                <button
                  className="analyze-button"
                  onClick={handleAnalyze}
                  disabled={loading || !description.trim()}
                >
                  <Sparkles size={18} />
                  {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                </button>
                <button className="cancel-button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p className="loading-text">
                Our AI is analyzing your symptoms...
              </p>
            </div>
          )}

          {/* Results Section */}
          {results && !loading && (
            <div className="results-section">
              {/* Emergency Warning */}
              {results.emergency_warning && (
                <div className="emergency-warning">
                  <AlertTriangle size={24} />
                  <div>
                    <strong>⚠️ Seek Immediate Medical Attention</strong>
                    <p style={{ margin: '4px 0 0 0' }}>
                      Based on your symptoms, we strongly recommend seeking
                      immediate medical care at the nearest emergency facility.
                    </p>
                  </div>
                </div>
              )}

              {/* Severity Badge */}
              <div className={`severity-badge ${getSeverityClass(results.severity)}`}>
                <Activity size={16} />
                Severity: {results.severity?.toUpperCase() || 'MODERATE'}
                <span className="confidence-indicator">
                  Confidence: {getConfidenceStars(results.confidence)}
                </span>
              </div>

              {/* Detected Symptoms */}
              {results.detected_symptoms && results.detected_symptoms.length > 0 && (
                <div className="result-card">
                  <h3>
                    <Heart size={20} />
                    Detected Symptoms
                  </h3>
                  <div className="symptoms-list">
                    {results.detected_symptoms.map((symptom, index) => (
                      <span key={index} className="symptom-tag">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {results.symptom_analysis && (
                <div className="result-card">
                  <h3>
                    <Sparkles size={20} />
                    Analysis
                  </h3>
                  <p className="analysis-text">{results.symptom_analysis}</p>
                </div>
              )}

              {/* Recommended Specializations */}
              {results.recommended_specializations &&
                results.recommended_specializations.length > 0 && (
                  <div className="result-card">
                    <h3>
                      <Stethoscope size={20} />
                      Recommended Specialists
                    </h3>
                    <div className="specializations-list">
                      {results.recommended_specializations.map((spec, index) => (
                        <span key={index} className="specialization-tag">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Suggested Doctors */}
              {results.has_matching_doctors ? (
                <div className="result-card">
                  <h3>
                    <Stethoscope size={20} />
                    Available Doctors ({results.suggested_doctors.length})
                  </h3>
                  <div className="doctors-grid">
                    {results.suggested_doctors.map((doctor) => (
                      <div key={doctor.id} className="doctor-card">
                        <div className="doctor-header">
                          {doctor.profile_picture ? (
                            <img
                              src={getImageUrl(doctor.profile_picture)}
                              alt={doctor.name}
                              className="doctor-avatar"
                            />
                          ) : (
                            <div className="doctor-avatar">
                              {doctor.name.charAt(0)}
                            </div>
                          )}
                          <div className="doctor-info">
                            <h4>{doctor.name}</h4>
                            <p className="doctor-spec">{doctor.specialization}</p>
                          </div>
                        </div>
                        <div className="doctor-phone">
                          <Phone size={14} />
                          {doctor.phone}
                        </div>
                        <button
                          className="book-appointment-btn"
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
                <div className="no-doctors-message">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>No Matching Doctors Available</strong>
                    <p style={{ margin: '4px 0 0 0' }}>
                      We couldn't find doctors in our database matching your symptoms.
                      Please try contacting a general practitioner or visit a nearby
                      hospital for consultation.
                    </p>
                  </div>
                </div>
              )}

              {/* Health Advice */}
              {results.health_advice && (
                <div className="health-advice-card">
                  <h3>
                    <Lightbulb size={20} />
                    Health Advice
                  </h3>
                  <p>{results.health_advice}</p>
                </div>
              )}

              {/* Additional Notes */}
              {results.additional_notes && (
                <div className="result-card">
                  <h3>
                    <AlertTriangle size={20} />
                    Important Notes
                  </h3>
                  <p className="analysis-text">{results.additional_notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons" style={{ marginTop: '24px' }}>
                <button
                  className="analyze-button"
                  onClick={() => {
                    setResults(null);
                    setDescription('');
                    setError('');
                  }}
                >
                  <Sparkles size={18} />
                  New Consultation
                </button>
                <button className="cancel-button" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDoctorConsultation;
