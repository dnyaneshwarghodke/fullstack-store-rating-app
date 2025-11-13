// src/components/StarRating.jsx
import React, { useState } from 'react';
 // We will create this CSS in our main index.css

const StarRating = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="star-rating">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button" // Important for forms
            key={ratingValue}
            className={ratingValue <= (hoverRating || rating) ? "star on" : "star off"}
            onClick={() => onRatingChange(ratingValue)}
            onMouseEnter={() => setHoverRating(ratingValue)}
            onMouseLeave={() => setHoverRating(0)}
          >
            ★ {/* This is just a unicode star character */}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;