import React, { createContext, useState, ReactNode, useMemo } from 'react';
import { User } from '../types';

// Mock users for simulation
const initialUsers: User[] = [
  { id: 'user-1', name: 'Admin Rey', role: 'admin', avatar: 'A', password: '123qazxcvbnm' },
  { id: 'user-2', name: 'User Bob', role: 'user', avatar: 'B', password: '12345' },
  { id: 'user-3', name: 'User Charlie', role: 'user', avatar: 'C', password: '12345' },
];

const generateUniqueId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  updateUserPassword: (userId: string, currentPassword: string, newPassword: string) => boolean;
  addUser: (user: Omit<User, 'id'>) => User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const login = (userId: string, password: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (user && user.password === password) {
      const { password: _, ...userToStore } = user; // Don't store password in currentUser state
      setCurrentUser(userToStore);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserPassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const user = users[userIndex];
    if (user.password !== currentPassword) return false;

    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...user, password: newPassword };
    setUsers(updatedUsers);
    return true;
  };

  const addUser = (userData: Omit<User, 'id'>): User | null => {
    if (!currentUser || currentUser.role !== 'admin') return null;
    
    const newUser: User = {
      ...userData,
      id: generateUniqueId('user'),
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const value = useMemo(() => ({
    currentUser,
    users: users.map(u => { // Never expose passwords to the rest of the app
      const { password, ...user } = u;
      return user;
    }),
    login,
    logout,
    updateUserPassword,
    addUser
  }), [currentUser, users]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
