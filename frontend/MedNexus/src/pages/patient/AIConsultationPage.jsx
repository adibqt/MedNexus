import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AIDoctorConsultation from '../../components/patient/AIDoctorConsultation';
import './AIConsultationPage.css';

const AIConsultationPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
    navigate('/patient/dashboard');
  };

  return (
    <div className="ai-consultation-page">
      <div className="ai-consultation-page-header">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="back-button"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>
      {showModal && <AIDoctorConsultation onClose={handleClose} />}
    </div>
  );
};

export default AIConsultationPage;
