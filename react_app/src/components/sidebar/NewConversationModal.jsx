import React, { useState, useEffect } from 'react';
import { getAllUsers, createConversation } from '../../services/api';

function NewConversationModal({ currentUser, onClose, onConversationCreated }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (isGroup && !groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await createConversation(
        selectedUsers,
        isGroup ? groupName : null,
        isGroup
      );
      onConversationCreated();
    } catch (err) {
      setError(err.message || 'Failed to create conversation');
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Conversation</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isGroup}
                onChange={(e) => setIsGroup(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Create group conversation
            </label>
          </div>

          {isGroup && (
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          )}

          <div style={{ marginBottom: '10px', fontWeight: '600' }}>
            Select users:
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading users...</div>
          ) : (
            <div className="user-list">
              {users.map(user => (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  style={{
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    backgroundColor: selectedUsers.includes(user.id) ? '#e8eaf6' : 'transparent',
                    marginBottom: '5px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => {}}
                    style={{ marginRight: '10px' }}
                  />
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>{user.avatar}</span>
                  <span>{user.username}</span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || selectedUsers.length === 0}
            className="create-button"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewConversationModal;