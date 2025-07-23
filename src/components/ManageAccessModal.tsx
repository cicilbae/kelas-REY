import React, { useState } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/useAuth';
import { Page } from '../types';
import UserAvatar from './auth/UserAvatar';

interface ManageAccessModalProps {
  page: Page;
  onClose: () => void;
}

const ManageAccessModal: React.FC<ManageAccessModalProps> = ({ page, onClose }) => {
  const { updatePageAccess } = useApp();
  const { users } = useAuth();
  const [accessList, setAccessList] = useState<string[]>(page.access);
  const [selectedUser, setSelectedUser] = useState<string>('');

  const usersWithAccess = users.filter(u => accessList.includes(u.id));
  const usersWithoutAccess = users.filter(u => !accessList.includes(u.id));

  const handleAddUser = () => {
    if (selectedUser && !accessList.includes(selectedUser)) {
      const newAccessList = [...accessList, selectedUser];
      setAccessList(newAccessList);
      updatePageAccess(page.id, newAccessList);
      setSelectedUser('');
    }
  };

  const handleRemoveUser = (userId: string) => {
    // Prevent removing the page creator
    if (userId === page.creatorId) {
      alert("Cannot remove the page creator.");
      return;
    }
    const newAccessList = accessList.filter(id => id !== userId);
    setAccessList(newAccessList);
    updatePageAccess(page.id, newAccessList);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Share "{page.title}"</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">Invite people to collaborate on this page.</p>
          
          {/* Add user section */}
          <div className="flex items-center gap-2">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user to add...</option>
              {usersWithoutAccess.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddUser}
              disabled={!selectedUser}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              <UserPlus size={16} className="mr-2" />
              Add
            </button>
          </div>

          {/* Users with access list */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            <h3 className="text-sm font-medium text-gray-500">People with access</h3>
            {usersWithAccess.map(user => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} size="md" />
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.id === page.creatorId ? 'Creator' : 'Editor'}</p>
                  </div>
                </div>
                {user.id !== page.creatorId && (
                  <button
                    onClick={() => handleRemoveUser(user.id)}
                    className="p-2 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Remove access"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAccessModal;
