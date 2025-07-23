import React from 'react';
import { User } from '../../types';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md' }) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  // Simple hash to get a consistent color for a user
  const colorIndex = user.id.charCodeAt(user.id.length - 1) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      title={user.name}
      className={`flex items-center justify-center rounded-full text-white font-bold ${bgColor} ${sizeClasses[size]}`}
    >
      {user.avatar}
    </div>
  );
};

export default UserAvatar;
