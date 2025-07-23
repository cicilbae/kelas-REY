import React from 'react';
import { BlockType } from '../types';

interface SlashCommandMenuProps {
  position: { top: number; left: number };
  blockTypes: BlockType[];
  selectedIndex: number;
  onSelect: (blockType: BlockType) => void;
  onClose: () => void;
}

const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  position,
  blockTypes,
  selectedIndex,
  onSelect,
}) => {
  return (
    <div
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[250px] max-h-80 overflow-y-auto"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
        BLOCKS
      </div>
      {blockTypes.map((blockType, index) => (
        <button
          key={blockType.type}
          onClick={() => onSelect(blockType)}
          className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
            index === selectedIndex ? 'bg-blue-50 text-blue-900' : 'text-gray-700'
          }`}
        >
          <span className="mr-3 text-lg flex-shrink-0">{blockType.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{blockType.label}</div>
            <div className="text-xs text-gray-500 truncate">{blockType.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SlashCommandMenu;
