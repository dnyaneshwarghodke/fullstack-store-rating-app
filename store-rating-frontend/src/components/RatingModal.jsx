// src/components/RatingModal.jsx
import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';


const RatingModal = ({ store, onClose, onSubmit }) => {
  // The modal's local state for the rating
  // It defaults to the user's *current* rating for this store, or 0
  const [rating, setRating] = useState(store.user_rating || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update local state if the store prop changes
  useEffect(() => {
    setRating(store.user_rating || 0);
  }, [store.user_rating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the onSubmit function passed down from StoreList
      // This function will handle the API call
      await onSubmit(store.id, rating);
      setIsLoading(false);
      onClose(); // Close the modal on success
    } catch (err) {
      setError(err.message || 'Failed to submit rating.');
      setIsLoading(false);
    }
  };

  return (
    // The "modal-overlay" is the dark background
    <div className="modal-overlay" onClick={onClose}>
      {/* The "modal-content" is the white box
          We use stopPropagation to prevent a click
          inside the modal from closing it.
      */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Rate: {store.name}</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <StarRating rating={rating} onRatingChange={setRating} />
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={rating === 0 || isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;