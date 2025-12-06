// src/components/CreateGroupModal.jsx

import React, { useState, useEffect } from 'react';
import { fetchUsers, createGroup } from '../../services/api'; 

function CreateGroupModal({ isOpen, onClose, currentUser, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([currentUser.id]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const loadUsers = async () => {
        setLoading(true);
        try {
          // Fetch all users from the backend
          const allUsers = await fetchUsers();
          setUsers(allUsers);
        } catch (err) {
          setError('Failed to load users.');
        } finally {
          setLoading(false);
        }
      };
      loadUsers();
      // Reset state when opening
      setGroupName('');
      setSelectedMembers([currentUser.id]); 
      setError(null);
    }
  }, [isOpen, currentUser.id]);

  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        // Prevent the current user from being unselected
        return userId === currentUser.id ? prev : prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMembers.length < 2) {
      setError('Please select at least one other person.');
      return;
    }
    if (groupName.trim() === '') {
      setError('Please enter a group name.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const newGroup = await createGroup(groupName.trim(), selectedMembers);
      onGroupCreated(newGroup); // Notify parent component of the new group
      onClose();
    } catch (err) {
      setError(err.message || 'Error creating group.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Create New Group Chat</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Group Name (e.g., CS 305 Study Group)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={loading}
          />

          <h4>Select Members:</h4>
          {loading && <p>Loading users...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <div className="member-list">
            {users.map(user => (
              <label key={user.id} className="user-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => handleMemberToggle(user.id)}
                  disabled={user.id === currentUser.id || loading} // Disable unselecting self
                />
                {user.name} {user.id === currentUser.id ? '(You)' : ''}
              </label>
            ))}
          </div>
          
          <div className="modal-actions">
            <button type="submit" disabled={loading || selectedMembers.length < 2}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroupModal;