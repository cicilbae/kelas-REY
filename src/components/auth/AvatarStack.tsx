import React from 'react';
import { User } from '../../types';
import UserAvatar from './UserAvatar';

interface AvatarStackProps {
  users: User[];
  max?: number;
}

const AvatarStack: React.FC<AvatarStackProps> = ({ users, max = 3 }) => {
  const visibleUsers = users.slice(0, max);
  const hiddenCount = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map(user => (
        <div key={user.id} className="ring-2 ring-white rounded-full">
          <UserAvatar user={user} size="md" />
        </div>
      ))}
      {hiddenCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};

export default AvatarStack;
