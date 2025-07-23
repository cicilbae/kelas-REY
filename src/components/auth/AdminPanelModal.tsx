import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import UserAvatar from './UserAvatar';
import { User } from '../../types';

interface AdminPanelModalProps {
  onClose: () => void;
}

const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ onClose }) => {
  const { users, addUser } = useAuth();
  const [newUser, setNewUser] = useState({ name: '', role: 'user' as 'user' | 'admin', password: '12345', avatar: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUser.name.trim() || !newUser.password.trim()) {
      setError('Name and password are required.');
      return;
    }
    
    const userToAdd: Omit<User, 'id'> = {
        ...newUser,
        avatar: newUser.name.charAt(0).toUpperCase()
    };

    const added = addUser(userToAdd);

    if (added) {
      setSuccess(`User "${added.name}" added successfully!`);
      setNewUser({ name: '', role: 'user', password: '12345', avatar: '' });
    } else {
      setError('Failed to add user. You might not have permission.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Admin Panel - User Management</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
            {/* Add User Form */}
            <div className="mb-6 border-b pb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Add New User</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" name="name" placeholder="Full Name" value={newUser.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        <select name="role" value={newUser.role} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <input type="password" name="password" placeholder="Default Password" value={newUser.password} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        <UserPlus size={16} className="mr-2" /> Add User
                    </button>
                    {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                    {success && <p className="text-sm text-green-600 mt-2">{success}</p>}
                </form>
            </div>

            {/* User List */}
            <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">All Users ({users.length})</h3>
                <div className="space-y-3">
                    {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="md" />
                        <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.id}</p>
                        </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'}`}>
                            {user.role}
                        </span>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelModal;
