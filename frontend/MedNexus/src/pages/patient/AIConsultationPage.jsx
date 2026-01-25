import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Send,
  AlertTriangle,
  Activity,
  Heart,
  Stethoscope,
  Phone,
  Calendar,
  Lightbulb,
  RefreshCw,
  TrendingUp,
  History,
  Clock,
  Trash2,
  X,
  User,
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  StopCircle,
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
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Doctor recommendations state
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [showDoctors, setShowDoctors] = useState(false);
  
  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);
  
  // Track if initial load is done
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your AI Health Assistant. 👋\n\nI'm here to help you understand your health concerns and connect you with the right specialists. You can tell me about any symptoms you're experiencing, ask health-related questions, or simply chat with me.\n\nHow can I help you today?",
        timestamp: new Date(),
      },
    ]);
    loadHistory();
    // Mark as initialized after a short delay
    setTimeout(() => setIsInitialized(true), 100);
  }, []);

  // Auto-scroll to bottom only after user sends a message (not on initial load)
  useEffect(() => {
    if (isInitialized && messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, isInitialized]);

  const scrollToBottom = () => {
    // Scroll only within the messages container, not the whole page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError('');

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 120) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please grant permission and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const processVoiceInput = async (audioBlob) => {
    setIsProcessingVoice(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Build conversation history
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Send audio directly to Gemini AI
      const response = await apiService.voiceChat(formData, conversationHistory);

      // Create assistant message with AI analysis
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        analysis: response.response_type === 'symptom_analysis' ? response : null,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Show doctor recommendations if available
      if (response.should_show_doctors && response.suggested_doctors?.length > 0) {
        setCurrentAnalysis(response);
        setShowDoctors(true);
      }

    } catch (err) {
      console.error('Voice processing error:', err);
      setError('Failed to process voice input. Please try again or type your message.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await apiService.getAIConsultationHistory(20, 0);
      setHistory(response.consultations || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message and clear input
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError('');
    setLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Send to AI
      const response = await apiService.aiChat(userMessage.content, conversationHistory);

      // Create assistant message
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        analysis: response.response_type === 'symptom_analysis' ? response : null,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If symptom analysis, store it for doctor display and reload history
      if (response.should_show_doctors && response.suggested_doctors?.length > 0) {
        setCurrentAnalysis(response);
        setShowDoctors(true);
        // Reload history to show the newly saved consultation
        loadHistory();
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setError(err.message || 'Failed to get response. Please try again.');
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your AI Health Assistant. 👋\n\nI'm here to help you understand your health concerns and connect you with the right specialists. You can tell me about any symptoms you're experiencing, ask health-related questions, or simply chat with me.\n\nHow can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setCurrentAnalysis(null);
    setShowDoctors(false);
    setError('');
    setInputValue('');
  };

  const handleViewHistoryItem = (item) => {
    // Create a simulated conversation from the history item
    const userMessage = {
      id: `user-history-${item.id}`,
      role: 'user',
      content: item.description,
      timestamp: new Date(item.created_at),
    };

    const assistantMessage = {
      id: `assistant-history-${item.id}`,
      role: 'assistant',
      content: item.symptom_analysis || 'Analysis of your symptoms...',
      timestamp: new Date(item.created_at),
      analysis: {
        response_type: 'symptom_analysis',
        detected_symptoms: item.detected_symptoms || [],
        symptom_analysis: item.symptom_analysis,
        recommended_specializations: item.recommended_specializations || [],
        severity: item.severity,
        confidence: item.confidence,
        emergency_warning: item.emergency_warning,
        health_advice: item.health_advice,
        suggested_doctors: item.suggested_doctors || [],
      },
    };

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm your AI Health Assistant. 👋\n\nI'm here to help you understand your health concerns and connect you with the right specialists. You can tell me about any symptoms you're experiencing, ask health-related questions, or simply chat with me.\n\nHow can I help you today?",
        timestamp: new Date(),
      },
      userMessage,
      assistantMessage,
    ]);

    // Set the analysis for doctor display
    if (item.has_matching_doctors && item.suggested_doctors?.length > 0) {
      setCurrentAnalysis({
        suggested_doctors: item.suggested_doctors,
        health_advice: item.health_advice,
      });
      setShowDoctors(true);
    }

    setShowHistory(false);
  };

  const handleBookAppointment = (doctorId) => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };

  const handleDeleteHistoryItem = async (e, consultationId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this consultation?')) {
      return;
    }
    try {
      await apiService.deleteAIConsultation(consultationId);
      setHistory(history.filter((h) => h.id !== consultationId));
    } catch (err) {
      console.error('Failed to delete consultation:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className="ai-chat-page">
      {/* Animated background orbs */}
      <div className="ai-orb ai-orb-1" />
      <div className="ai-orb ai-orb-2" />
      <div className="ai-orb ai-orb-3" />

      <div className="ai-chat-container">
        {/* Header */}
        <header className="ai-chat-header">
          <div className="ai-header-left">
            <button className="ai-back-btn" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft size={18} />
              <span>Dashboard</span>
            </button>
          </div>

          <div className="ai-header-center">
            <div className="ai-header-title">
              <div className="ai-logo">
                <Bot />
              </div>
              <div className="ai-header-text">
                <h1>AI Health Assistant</h1>
                <p className="ai-status">
                  <span className="ai-status-dot" />
                  Online & Ready to Help
                </p>
              </div>
            </div>
          </div>

          <div className="ai-header-right">
            <button className="ai-new-chat-btn" onClick={handleNewChat}>
              <Plus size={18} />
              <span>New Chat</span>
            </button>
            <button
              className="ai-history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History size={18} />
              <span>History</span>
              {history.length > 0 && (
                <span className="ai-history-count">{history.length}</span>
              )}
            </button>
          </div>
        </header>

        {/* History Sidebar */}
        {showHistory && (
          <div className="ai-history-overlay" onClick={() => setShowHistory(false)}>
            <div className="ai-history-sidebar" onClick={(e) => e.stopPropagation()}>
              <div className="ai-history-header">
                <h3>
                  <History size={20} />
                  Previous Consultations
                </h3>
                <button className="ai-history-close" onClick={() => setShowHistory(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="ai-history-list">
                {historyLoading ? (
                  <div className="ai-history-loading">Loading history...</div>
                ) : history.length === 0 ? (
                  <div className="ai-history-empty">
                    <Clock size={40} />
                    <p>No previous consultations</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      className="ai-history-item"
                      onClick={() => handleViewHistoryItem(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="ai-history-item-content">
                        <p className="ai-history-description">
                          {item.description.length > 80
                            ? item.description.substring(0, 80) + '...'
                            : item.description}
                        </p>
                        <div className="ai-history-meta">
                          <span className={`ai-history-severity ${getSeverityClass(item.severity)}`}>
                            {item.severity}
                          </span>
                          <span className="ai-history-date">{formatDate(item.created_at)}</span>
                        </div>
                      </div>
                      <button
                        className="ai-history-delete"
                        onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="ai-chat-main">
          {/* Messages Container */}
          <div className="ai-messages-container" ref={messagesContainerRef}>
            <div className="ai-messages-list">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`ai-message ${message.role === 'user' ? 'ai-message-user' : 'ai-message-assistant'} ${message.isError ? 'ai-message-error' : ''}`}
                >
                  <div className="ai-message-avatar">
                    {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="ai-message-content">
                    <div className="ai-message-bubble">
                      <p className="ai-message-text">{message.content}</p>
                      
                      {/* Inline Analysis Results */}
                      {message.analysis && (
                        <div className="ai-inline-analysis">
                          {/* Emergency Warning */}
                          {message.analysis.emergency_warning && (
                            <div className="ai-emergency-inline">
                              <AlertTriangle size={16} />
                              <span>⚠️ Seek Immediate Medical Attention</span>
                            </div>
                          )}

                          {/* Severity & Confidence */}
                          <div className="ai-analysis-badges">
                            <span className={`ai-badge ${getSeverityClass(message.analysis.severity)}`}>
                              <Activity size={12} />
                              {message.analysis.severity?.toUpperCase()}
                            </span>
                            <span className="ai-badge ai-confidence">
                              <TrendingUp size={12} />
                              {message.analysis.confidence?.toUpperCase()} Confidence
                            </span>
                          </div>

                          {/* Detected Symptoms */}
                          {message.analysis.detected_symptoms?.length > 0 && (
                            <div className="ai-symptoms-inline">
                              <div className="ai-symptoms-label">
                                <Heart size={14} />
                                Detected Symptoms:
                              </div>
                              <div className="ai-symptoms-tags">
                                {message.analysis.detected_symptoms.map((symptom, idx) => (
                                  <span key={idx} className="ai-symptom-tag">{symptom}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommended Specializations */}
                          {message.analysis.recommended_specializations?.length > 0 && (
                            <div className="ai-specs-inline">
                              <div className="ai-specs-label">
                                <Stethoscope size={14} />
                                Recommended Specialists:
                              </div>
                              <div className="ai-specs-list">
                                {message.analysis.recommended_specializations.map((spec, idx) => (
                                  <div key={idx} className="ai-spec-inline">
                                    <span className="ai-spec-name">{spec.name}</span>
                                    <span className={`ai-spec-match ${getMatchClass(spec.match_percentage)}`}>
                                      {spec.match_percentage}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="ai-message-time">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="ai-message ai-message-assistant">
                  <div className="ai-message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="ai-message-content">
                    <div className="ai-message-bubble ai-typing">
                      <div className="ai-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Recommendations Panel */}
          {currentAnalysis && currentAnalysis.suggested_doctors?.length > 0 && (
            <div className={`ai-doctors-panel ${showDoctors ? 'expanded' : 'collapsed'}`}>
              <button
                className="ai-doctors-toggle"
                onClick={() => setShowDoctors(!showDoctors)}
              >
                <Stethoscope size={18} />
                <span>
                  {currentAnalysis.suggested_doctors.length} Doctor{currentAnalysis.suggested_doctors.length > 1 ? 's' : ''} Available
                </span>
                {showDoctors ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>

              {showDoctors && (
                <div className="ai-doctors-list">
                  {currentAnalysis.suggested_doctors.map((doctor) => (
                    <div key={doctor.id} className="ai-doctor-card-mini">
                      <div className="ai-doctor-info-mini">
                        {doctor.profile_picture ? (
                          <img
                            src={getImageUrl(doctor.profile_picture)}
                            alt={doctor.name}
                            className="ai-doctor-avatar-mini"
                          />
                        ) : (
                          <div className="ai-doctor-avatar-mini ai-doctor-avatar-placeholder">
                            {doctor.name?.charAt(0) || 'D'}
                          </div>
                        )}
                        <div className="ai-doctor-details-mini">
                          <h4>Dr. {doctor.name}</h4>
                          <p>
                            <Stethoscope size={12} />
                            {doctor.specialization}
                          </p>
                        </div>
                        <span className={`ai-match-mini ${getMatchClass(doctor.match_percentage)}`}>
                          {doctor.match_percentage}%
                        </span>
                      </div>
                      <button
                        className="ai-book-btn-mini"
                        onClick={() => handleBookAppointment(doctor.id)}
                      >
                        <Calendar size={14} />
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Health Advice */}
          {currentAnalysis?.health_advice && (
            <div className="ai-advice-banner">
              <Lightbulb size={16} />
              <p>{currentAnalysis.health_advice}</p>
            </div>
          )}

          {/* Input Area */}
          <div className="ai-input-container">
            {/* Voice Recording Controls */}
            {(isRecording || isProcessingVoice) && (
              <div className="voice-status-bar">
                {isRecording && (
                  <>
                    <div className="recording-pulse-dot"></div>
                    <span className="recording-text">Recording: {formatRecordingTime(recordingTime)}</span>
                    <button
                      className="voice-stop-btn-small"
                      onClick={stopRecording}
                      title="Stop recording"
                    >
                      <StopCircle size={16} />
                      Stop
                    </button>
                  </>
                )}
                {isProcessingVoice && (
                  <>
                    <Loader2 size={16} className="ai-spin" />
                    <span>AI is analyzing your voice...</span>
                  </>
                )}
              </div>
            )}
            
            <div className="ai-input-wrapper">
              <button
                className={`voice-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading || isProcessingVoice}
                title={isRecording ? "Stop recording" : "Record voice"}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <textarea
                ref={inputRef}
                className="ai-input"
                placeholder="Type your message... (Press Enter to send)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || isRecording || isProcessingVoice}
                rows={1}
              />
              <button
                className="ai-send-btn"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
              >
                {loading ? <Loader2 size={20} className="ai-spin" /> : <Send size={20} />}
              </button>
            </div>
            <p className="ai-input-hint">
              💡 Tip: Describe your symptoms in detail for better recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConsultationPage;
