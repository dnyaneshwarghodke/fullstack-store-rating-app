// src/components/StoreManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Re-use the modal and table styles


// This is the "Create Store" Modal
const CreateStoreModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState(''); // Holds the ID of the selected owner
  
  const [owners, setOwners] = useState([]); // Holds the list of available owners
  const [loadingOwners, setLoadingOwners] = useState(true);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- SMART FEATURE ---
  // When the modal opens, fetch a list of all users
  // with the 'OWNER' role to populate the dropdown.
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoadingOwners(true);
        // We call the GET /users route with a filter
        const response = await api.get('/users?role=OWNER');
        setOwners(response.data);
      } catch (err) {
        setError('Failed to load store owners.');
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchOwners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // We call the Admin POST /stores route
      await api.post('/stores', {
        name,
        email,
        address,
        // Send 'null' if no owner is selected
        owner_id: ownerId ? parseInt(ownerId, 10) : null 
      });
      onSuccess(); // Tell the parent to re-fetch stores
      onClose(); // Close the modal
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to create store.');
      } else {
        setError('Failed to create store. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Store</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form" style={{ boxShadow: 'none', padding: '1rem 0' }}>
          <div className="form-group">
            <label>Store Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Store Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Store Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Assign Owner (Optional)</label>
            {loadingOwners ? (
              <p>Loading owners...</p>
            ) : (
              <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                <option value="">-- No Owner --</option>
                {owners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} (Email: {owner.email})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// This is the main "Store Management" component
const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: ''
  });

  // Function to fetch stores from the API
  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.address) params.append('address', filters.address);
      
      // Call the GET /stores/admin-list route
      const response = await api.get(`/stores/admin-list?${params.toString()}`);
      setStores(response.data);
    } catch (err) {
      setError('Failed to fetch stores.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stores when the component first loads
  useEffect(() => {
    fetchStores();
  }, []); // Run only once on mount

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // This is called by the "Filter" button
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchStores(); // Re-fetch with the new filters
  };

  // This is called by the CreateStoreModal on success
  const handleStoreCreated = () => {
    fetchStores(); // Re-fetch to show the new store
  };

  return (
    <div className="store-management-container">
      {/* 1. THE FILTER BAR */}
      <form onSubmit={handleFilterSubmit} className="admin-filter-bar">
        <input type="text" name="name" placeholder="Filter by Name..." value={filters.name} onChange={handleFilterChange} />
        <input type="text" name="email" placeholder="Filter by Email..." value={filters.email} onChange={handleFilterChange} />
        <input type="text" name="address" placeholder="Filter by Address..." value={filters.address} onChange={handleFilterChange} />
        <button type="submit">Filter</button>
      </form>

      {/* 2. THE CREATE STORE BUTTON */}
      <div className="admin-header">
        <h4>All Stores</h4>
        <button className="btn-create" onClick={() => setIsCreateModalOpen(true)}>
          + Create New Store
        </button>
      </div>

      {/* 3. THE STORE TABLE */}
      {loading && <p>Loading stores...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <table className="raters-table">
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Avg. Rating</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.email}</td>
                <td>{store.address}</td>
                <td className="store-rating-cell">
                  {store.overall_rating ? `${store.overall_rating} ★` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* 4. THE MODAL (Conditionally Rendered) */}
      {isCreateModalOpen && (
        <CreateStoreModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={handleStoreCreated}
        />
      )}
    </div>
  );
};

export default StoreManagement;