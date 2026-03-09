import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';
import apiService from '../../services/api';
import './RatingModal.css';

const RatingModal = ({ appointment, onClose, onRated }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await apiService.submitRating({
        appointment_id: appointment.id,
        rating,
        review: review.trim() || null,
      });
      onRated(appointment.id, rating);
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="rating-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="rating-modal"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="rating-modal-close" onClick={onClose}>
            <X size={18} />
          </button>

          <div className="rating-modal-header">
            <div className="rating-modal-icon">
              <Star size={22} />
            </div>
            <h3 className="rating-modal-title">Rate Your Experience</h3>
            <p className="rating-modal-doctor">
              Dr. {appointment.doctor_name || appointment.doctor?.name}
            </p>
          </div>

          <div className="rating-modal-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-modal-star ${
                  star <= (hoveredStar || rating) ? 'rating-modal-star--active' : ''
                }`}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => { setRating(star); setError(''); }}
              >
                <Star
                  size={36}
                  fill={star <= (hoveredStar || rating) ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          {(hoveredStar || rating) > 0 && (
            <p className="rating-modal-label">{labels[hoveredStar || rating]}</p>
          )}

          <textarea
            className="rating-modal-textarea"
            placeholder="Share your experience (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            maxLength={1000}
          />

          {error && <p className="rating-modal-error">{error}</p>}

          <button
            type="button"
            className="rating-modal-submit"
            disabled={submitting || rating === 0}
            onClick={handleSubmit}
          >
            {submitting ? (
              <div className="rating-modal-spinner" />
            ) : (
              <>
                Submit Rating
                <Send size={16} />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RatingModal;
