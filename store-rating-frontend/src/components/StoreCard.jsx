// src/components/StoreCard.jsx
import React from 'react';

// We now accept an 'onRateClick' function as a prop
const StoreCard = ({ store, onRateClick }) => {
  
  // This helper is called by both the button and the rating span
  const handleRateClick = () => {
    onRateClick(store); // Pass the *entire store object* up
  };

  return (
    <div className="store-card">
      <div className="store-info">
        <h3>{store.name}</h3>
        <p>{store.address}</p>
        <p className="store-email">{store.email}</p>
      </div>
      <div className="store-ratings">
        <div className="rating-box">
          <strong>Overall Rating</strong>
          <span>{store.overall_rating ? `${store.overall_rating} ★` : 'N/A'}</span>
        </div>
        <div className="rating-box">
          <strong>Your Rating</strong>
          {store.user_rating ? (
            // If user *has* rated, make the rating clickable to modify it
            <span 
              className="user-has-rated" 
              onClick={handleRateClick} 
              title="Click to modify your rating"
            >
              {store.user_rating} ★
            </span>
          ) : (
            // If user has *not* rated, show the "Rate Now" button
            <button className="rate-button" onClick={handleRateClick}>
              Rate Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;