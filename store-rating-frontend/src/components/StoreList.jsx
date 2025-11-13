// src/components/StoreList.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Our API service
import StoreCard from './StoreCard'; // The component we just made
import RatingModal from './RatingModal'; // The new modal component

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NEW STATE FOR THE MODAL ---
  // This will hold the store object that the user
  // wants to rate. If null, the modal is hidden.
  const [selectedStore, setSelectedStore] = useState(null);

  // This function fetches stores from our backend
  const fetchStores = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/stores?search=${query}`);
      setStores(response.data);
    } catch (err) {
      setError('Failed to fetch stores. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run once on component load
  useEffect(() => {
    fetchStores();
  }, []); 

  // This function is called when the user clicks the "Search" button
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores(searchTerm);
  };
  
  // --- NEW FUNCTIONS FOR THE MODAL ---

  // This is called by StoreCard when a user clicks "Rate Now"
  // It sets the selectedStore, which causes the modal to open.
  const handleRateClick = (store) => {
    setSelectedStore(store);
  };

  // This is called by the modal to close itself
  const handleCloseModal = () => {
    setSelectedStore(null);
  };

  // This is called when the user clicks "Submit" in the modal
  const handleRatingSubmit = async (storeId, ratingValue) => {
    try {
      // We call our backend 'POST /ratings' endpoint!
      await api.post('/ratings', {
        store_id: storeId,
        rating_value: ratingValue,
      });
      
      // THIS IS THE KEY:
      // After successfully submitting, we re-fetch all stores.
      // This will get the new "overall_rating" and "user_rating"
      // and cause the UI to update automatically!
      fetchStores(searchTerm);

    } catch (err) {
      console.error('Failed to submit rating:', err);
      // We re-throw the error so the modal can display it
      throw new Error(err.response?.data?.message || 'Failed to submit rating.');
    }
  };

  // Helper function to render the main content
  const renderContent = () => {
    if (loading) {
      return <p>Loading stores...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (stores.length === 0) {
      return <p>No stores found.</p>;
    }
    return (
      <div className="store-list">
        {stores.map(store => (
          <StoreCard 
            key={store.id} 
            store={store}
            // We pass the "rate click" handler down to the card
            onRateClick={handleRateClick} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="store-list-container">
      <h3>All Stores</h3>
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Search by name or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      
      {renderContent()}
      
      {/* --- RENDER THE MODAL ---
        This is a "conditional render".
        If 'selectedStore' is not null, it will render
        the RatingModal component. If it is null,
        it renders nothing.
      */}
      {selectedStore && (
        <RatingModal 
          store={selectedStore} 
          onClose={handleCloseModal} 
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default StoreList;