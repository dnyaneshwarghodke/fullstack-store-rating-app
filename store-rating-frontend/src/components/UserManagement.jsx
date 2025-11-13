// src/components/UserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Re-use the modal and star rating styles
 // for table

// ... (CreateUserModal component is unchanged)
const CreateUserModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('NORMAL');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/users', { name, email, address, password, role });
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMsg = err.response.data.errors.map(er => er.msg).join(', ');
        setError(errorMsg);
      } else if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to create user.');
      } else {
        setError('Failed to create user. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Create New User</h3>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form" style={{ boxShadow: 'none', padding: '1rem 0' }}>
          <div className="form-group">
            <label>Full Name (min 20 chars)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Address (max 400 chars)</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password (8-16 chars, 1 upper, 1 special)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="NORMAL">Normal User</option>
              <option value="OWNER">Store Owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ... (UserDetailsModal component is unchanged)
const UserDetailsModal = ({ userId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${userId}`);
        setDetails(response.data);
      } catch (err) {
        setError('Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [userId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>User Details</h3>
        {loading && <p>Loading details...</p>}
        {error && <p className="error-message">{error}</p>}
        {details && (
          <div className="user-details-content">
            <p><strong>ID:</strong> {details.id}</p>
            <p><strong>Name:</strong> {details.name}</p>
            <p><strong>Email:</strong> {details.email}</p>
            <p><strong>Address:</strong> {details.address}</p>
            <p><strong>Role:</strong> {details.role}</p>
            
            {details.role === 'OWNER' && details.store_info && (
              <div className="owner-store-info">
                <h4>Owned Store Info</h4>
                <p><strong>Store Name:</strong> {details.store_info.store_name}</p>
                <p><strong>Avg. Rating:</strong> {details.store_info.average_rating ? `${details.store_info.average_rating} ★` : 'N/A'}</p>
              </div>
            )}
            {details.role === 'OWNER' && !details.store_info && (
               <p><em>This owner is not yet linked to a store.</em></p>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// --- MAIN UserManagement COMPONENT (THIS IS UPDATED) ---
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });
  
  // --- 1. NEW SORTING STATE ---
  const [sortConfig, setSortConfig] = useState({
    key: 'id',      // The "key" to sort by (matches API param)
    direction: 'ASC' // 'ASC' or 'DESC'
  });
  
  // --- 2. 'fetchUsers' IS NOW A 'useCallback' ---
  // It now depends on filters and sortConfig.
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Add filters
      if (filters.name) params.append('name', filters.name);
      if (filters.email) params.append('email', filters.email);
      if (filters.address) params.append('address', filters.address);
      if (filters.role) params.append('role', filters.role);
      
      // Add sorting
      params.append('sortBy', sortConfig.key);
      params.append('order', sortConfig.direction);
      
      // Call the GET /users route
      const response = await api.get(`/users?${params.toString()}`);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig]); // <-- Re-run this function if filters or sortConfig change
  
  // --- 3. 'useEffect' now calls the memoized 'fetchUsers' ---
  // This will run on mount, and any time 'fetchUsers' (i.e., its dependencies) changes.
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); 

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers(); // Re-fetch with the new filters
  };

  const handleUserCreated = () => {
    fetchUsers(); // Re-fetch to show the new user
  };

  // --- 4. NEW SORT HANDLER ---
  const handleSort = (key) => {
    let direction = 'ASC';
    // If clicking the same column, toggle direction
    if (sortConfig.key === key && sortConfig.direction === 'ASC') {
      direction = 'DESC';
    }
    // Set the new sort config
    setSortConfig({ key, direction });
  };

  // --- 5. NEW FUNCTION TO RENDER SORT ARROWS ---
  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return null; // No arrow
    if (sortConfig.direction === 'ASC') return <span className="sort-arrow">▲</span>;
    return <span className="sort-arrow">▼</span>;
  };

  return (
    <div className="user-management-container">
      {/* 1. THE FILTER BAR (Unchanged) */}
      <form onSubmit={handleFilterSubmit} className="admin-filter-bar">
        {/* ... (filter inputs are unchanged) ... */}
        <input type="text" name="name" placeholder="Filter by Name..." value={filters.name} onChange={handleFilterChange} />
        <input type="text" name="email" placeholder="Filter by Email..." value={filters.email} onChange={handleFilterChange} />
        <input type="text" name="address" placeholder="Filter by Address..." value={filters.address} onChange={handleFilterChange} />
        <select name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">All Roles</option>
          <option value="NORMAL">Normal</option>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit">Filter</button>
      </form>

      {/* 2. THE CREATE USER BUTTON (Unchanged) */}
      <div className="admin-header">
        <h4>All Users</h4>
        <button className="btn-create" onClick={() => setIsCreateModalOpen(true)}>
          + Create New User
        </button>
      </div>

      {/* 3. THE USER TABLE (HEADERS ARE NOW CLICKABLE) */}
      {loading && <p>Loading users...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <table className="raters-table">
          <thead>
            <tr>
              {/* --- 6. MODIFIED TABLE HEADERS --- */}
              <th className="sortable" onClick={() => handleSort('name')}>
                Name {getSortArrow('name')}
              </th>
              <th className="sortable" onClick={() => handleSort('email')}>
                Email {getSortArrow('email')}
              </th>
              <th className="sortable" onClick={() => handleSort('address')}>
                Address {getSortArrow('address')}
              </th>
              <th className="sortable" onClick={() => handleSort('role')}>
                Role {getSortArrow('role')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td><span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span></td>
                <td>
                  <button 
                    className="btn-view-details"
                    onClick={() => setViewingUserId(user.id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* 4. THE MODALS (Unchanged) */}
      {isCreateModalOpen && (
        <CreateUserModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={handleUserCreated}
        />
      )}
      {viewingUserId && (
        <UserDetailsModal 
          userId={viewingUserId} 
          onClose={() => setViewingUserId(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;