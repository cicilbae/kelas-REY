import React, { useState } from 'react';
import { useAuth } from '../../auth/useAuth';

const Login: React.FC = () => {
  const { users, login } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedUserId && password) {
      const success = login(selectedUserId, password);
      if (!success) {
        setError('Invalid username or password.');
      }
    } else {
      setError('Please select a user and enter a password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <div className="mx-auto mb-4 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-3xl">
                R
            </div>
          <h1 className="text-2xl font-bold text-gray-900">Kelas REY</h1>
          <p className="text-gray-600">Please select a user to log in</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
              Select User
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
