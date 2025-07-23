import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Block, BlockType } from '../types';
import EditableBlock from './EditableBlock';
import SlashCommandMenu from './SlashCommandMenu';

interface BlockEditorProps {
  pageId: string;
  readOnly: boolean;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ pageId, readOnly }) => {
  const { getPageBlocks, addBlock, updateBlock, deleteBlock } = useApp();
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  const blocks = getPageBlocks(pageId);

  const blockTypes: BlockType[] = [
    { type: 'text', label: 'Text', icon: '📝', description: 'Simple text block' },
    { type: 'heading', label: 'Heading', icon: '📋', description: 'Large heading text' },
    { type: 'todo', label: 'To-do', icon: '☑️', description: 'Checkbox with text' },
    { type: 'image', label: 'Image', icon: '🖼️', description: 'Upload and display image' },
    { type: 'file', label: 'File', icon: '📎', description: 'Upload a file' },
    { type: 'toggle', label: 'Toggle', icon: '▶️', description: 'Collapsible content block' },
    { type: 'divider', label: 'Divider', icon: '➖', description: 'Horizontal divider line' },
    { type: 'code', label: 'Code', icon: '💻', description: 'Code block with syntax' }
  ];

  const handleBlockContentChange = (blockId: string, content: string) => {
    if (readOnly) return;
    updateBlock(blockId, { content });

    if (content.endsWith('/')) {
      const blockElement = document.getElementById(`block-${blockId}`);
      if (blockElement) {
        const rect = blockElement.getBoundingClientRect();
        setSlashMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
        setShowSlashMenu(true);
        setFocusedBlockId(blockId);
        setSelectedSlashIndex(0);
      }
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string, parentBlockId?: string) => {
    if (readOnly) return;
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    switch (e.key) {
      case 'Enter':
        if (showSlashMenu) {
          e.preventDefault();
          handleSlashMenuSelect(blockTypes[selectedSlashIndex]);
        } else {
          e.preventDefault();
          const newBlock = addBlock(pageId, blockId, parentBlockId);
          if (newBlock) {
            setTimeout(() => {
              const newBlockElement = document.getElementById(`block-${newBlock.id}`);
              const input = newBlockElement?.querySelector('input, textarea, [contenteditable]') as HTMLElement;
              input?.focus();
            }, 0);
          }
        }
        break;

      case 'Backspace':
        if (block.content === '') {
          e.preventDefault();
          const allBlocks = parentBlockId ? blocks.filter(b => b.parentBlockId === parentBlockId) : blocks.filter(b => !b.parentBlockId);
          const blockIndex = allBlocks.findIndex(b => b.id === blockId);
          if (blockIndex > 0) {
            const prevBlock = allBlocks[blockIndex - 1];
            deleteBlock(blockId);
            setTimeout(() => {
              const prevBlockElement = document.getElementById(`block-${prevBlock.id}`);
              const input = prevBlockElement?.querySelector('input, textarea, [contenteditable]') as HTMLElement;
              input?.focus();
            }, 0);
          }
        }
        break;

      case 'ArrowUp':
        if (showSlashMenu) {
          e.preventDefault();
          setSelectedSlashIndex(prev => prev > 0 ? prev - 1 : blockTypes.length - 1);
        }
        break;

      case 'ArrowDown':
        if (showSlashMenu) {
          e.preventDefault();
          setSelectedSlashIndex(prev => prev < blockTypes.length - 1 ? prev + 1 : 0);
        }
        break;

      case 'Escape':
        if (showSlashMenu) {
          e.preventDefault();
          setShowSlashMenu(false);
          updateBlock(blockId, { content: block.content.slice(0, -1) });
        }
        break;
    }
  };

  const handleSlashMenuSelect = (blockType: BlockType) => {
    if (focusedBlockId) {
      const block = blocks.find(b => b.id === focusedBlockId);
      if (block) {
        const updates: Partial<Block> = {
          type: blockType.type,
          content: ['divider', 'file'].includes(blockType.type) ? '' : block.content.slice(0, -1)
        };
        if (blockType.type === 'todo') updates.checked = false;
        else if (blockType.type === 'toggle') {
          updates.isExpanded = false;
          updates.children = [];
        } else if (blockType.type === 'code') updates.language = 'javascript';
        updateBlock(focusedBlockId, updates);
      }
    }
    setShowSlashMenu(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (showSlashMenu && !editorRef.current?.contains(e.target as Node)) {
      setShowSlashMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSlashMenu]);

  useEffect(() => {
    if (blocks.length === 0 && !readOnly) {
      addBlock(pageId);
    }
  }, [blocks.length, pageId, addBlock, readOnly]);

  return (
    <div ref={editorRef} className="relative">
      <div className="space-y-2">
        {blocks.map((block) => (
          <EditableBlock
            key={block.id}
            block={block}
            readOnly={readOnly}
            onContentChange={handleBlockContentChange}
            onKeyDown={handleKeyDown}
            onToggleCheck={(checked) => updateBlock(block.id, { checked })}
            onUpdateBlock={(updates) => updateBlock(block.id, updates)}
          />
        ))}
      </div>

      {showSlashMenu && !readOnly && (
        <SlashCommandMenu
          position={slashMenuPosition}
          blockTypes={blockTypes}
          selectedIndex={selectedSlashIndex}
          onSelect={handleSlashMenuSelect}
          onClose={() => setShowSlashMenu(false)}
        />
      )}
    </div>
  );
};

export default BlockEditor;
