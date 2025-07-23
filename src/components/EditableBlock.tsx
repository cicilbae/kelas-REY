import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Upload, File, FileText, FileImage, Download, Trash2, UploadCloud } from 'lucide-react';
import { Block } from '../types';
import { useApp } from '../context/AppContext';

interface EditableBlockProps {
  block: Block;
  readOnly: boolean;
  onContentChange: (blockId: string, content: string) => void;
  onKeyDown: (e: React.KeyboardEvent, blockId: string, parentBlockId?: string) => void;
  onToggleCheck?: (checked: boolean) => void;
  onUpdateBlock: (updates: Partial<Block>) => void;
}

const EditableBlock: React.FC<EditableBlockProps> = ({
  block,
  readOnly,
  onContentChange,
  onKeyDown,
  onToggleCheck,
  onUpdateBlock
}) => {
  const { getChildBlocks, toggleBlockExpansion, addBlock } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const childBlocks = block.type === 'toggle' ? getChildBlocks(block.id) : [];

  const handleClick = () => {
    if (readOnly || ['divider', 'image', 'file'].includes(block.type)) return;
    setIsEditing(true);
  };

  const handleBlur = () => setIsEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'language') onUpdateBlock({ language: e.target.value });
    else onContentChange(block.id, e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => onKeyDown(e, block.id, block.parentBlockId);
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => onToggleCheck?.(e.target.checked);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => onUpdateBlock({ src: event.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateBlock({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleToggleExpansion = () => toggleBlockExpansion(block.id);

  const handleAddChildBlock = () => {
    if (readOnly) return;
    const newBlock = addBlock(block.pageId, undefined, block.id);
    if (newBlock) {
      setTimeout(() => {
        const newBlockElement = document.getElementById(`block-${newBlock.id}`);
        const input = newBlockElement?.querySelector('input, textarea, [contenteditable]') as HTMLElement;
        input?.focus();
      }, 0);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const getPlaceholder = () => {
    if (readOnly) return "Read-only";
    if (block.content === '') return "Type '/' for commands";
    return '';
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType?: string): React.ReactNode => {
    if (!fileType) return <File size={24} className="text-gray-500" />;
    if (fileType.startsWith('image/')) return <FileImage size={24} className="text-purple-500" />;
    if (fileType === 'application/pdf') return <FileText size={24} className="text-red-500" />;
    return <File size={24} className="text-gray-500" />;
  };

  const commonInputClasses = "w-full bg-transparent border-none outline-none placeholder-gray-400 resize-none";
  const readOnlyClasses = readOnly ? "cursor-default" : "cursor-text";

  const renderTextBlock = () => {
    if (isEditing && !readOnly) {
      return <input ref={inputRef as React.RefObject<HTMLInputElement>} type="text" value={block.content} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={getPlaceholder()} className={`${commonInputClasses} text-gray-900 text-base leading-relaxed`} />;
    }
    return <div onClick={handleClick} className={`w-full text-gray-900 text-base leading-relaxed min-h-[1.5rem] py-1 ${readOnlyClasses}`}>{block.content || <span className="text-gray-400">{getPlaceholder()}</span>}</div>;
  };

  const renderHeadingBlock = () => {
    if (isEditing && !readOnly) {
      return <input ref={inputRef as React.RefObject<HTMLInputElement>} type="text" value={block.content} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={getPlaceholder()} className={`${commonInputClasses} text-gray-900 text-2xl font-bold leading-tight`} />;
    }
    return <div onClick={handleClick} className={`w-full text-gray-900 text-2xl font-bold leading-tight min-h-[2rem] py-1 ${readOnlyClasses}`}>{block.content || <span className="text-gray-400 text-2xl font-bold">{getPlaceholder()}</span>}</div>;
  };

  const renderTodoBlock = () => {
    const textClasses = block.checked ? 'text-gray-500 line-through' : 'text-gray-900';
    return (
      <div className="flex items-start space-x-3">
        <input type="checkbox" checked={block.checked || false} onChange={handleCheckboxChange} disabled={readOnly} className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-200" />
        <div className="flex-1">
          {isEditing && !readOnly ? (
            <input ref={inputRef as React.RefObject<HTMLInputElement>} type="text" value={block.content} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={getPlaceholder()} className={`${commonInputClasses} text-base leading-relaxed ${textClasses}`} />
          ) : (
            <div onClick={handleClick} className={`w-full text-base leading-relaxed min-h-[1.5rem] py-1 ${readOnlyClasses} ${textClasses}`}>{block.content || <span className="text-gray-400 no-underline">{getPlaceholder()}</span>}</div>
          )}
        </div>
      </div>
    );
  };

  const renderImageBlock = () => {
    return (
      <div className="space-y-3">
        {block.src ? (
          <div className="relative group">
            <img src={block.src} alt="Uploaded content" className="max-w-full h-auto rounded-lg border border-gray-200" style={{ maxWidth: '600px' }} />
            {!readOnly && <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black bg-opacity-50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Upload className="mr-2" size={20} />Replace Image</button>}
          </div>
        ) : (
          <div onClick={() => !readOnly && fileInputRef.current?.click()} className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${readOnly ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-400'}`}>
            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-500">{readOnly ? 'Image upload disabled' : 'Click to upload an image'}</p>
          </div>
        )}
        {!readOnly && <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />}
      </div>
    );
  };

  const renderFileBlock = () => {
    if (!block.fileUrl) {
      return (
        <div>
          <label htmlFor={`file-upload-${block.id}`} className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col items-center justify-center transition-colors ${readOnly ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'}`}>
            <UploadCloud className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-600 font-medium">{readOnly ? 'File upload disabled' : 'Click to upload a file'}</p>
            {!readOnly && <p className="text-sm text-gray-500">or drag and drop</p>}
          </label>
          {!readOnly && <input id={`file-upload-${block.id}`} type="file" onChange={handleFileUpload} className="hidden" />}
        </div>
      );
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">{getFileIcon(block.fileType)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{block.fileName}</p>
            <p className="text-xs text-gray-500">{formatFileSize(block.fileSize)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <a href={block.fileUrl} download={block.fileName} className="p-2 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors" title="Download"><Download size={16} /></a>
          {!readOnly && <button onClick={() => onUpdateBlock({ fileName: undefined, fileUrl: undefined, fileSize: undefined, fileType: undefined })} className="p-2 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Remove"><Trash2 size={16} /></button>}
        </div>
      </div>
    );
  };

  const renderToggleBlock = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <button onClick={handleToggleExpansion} className="p-1 rounded hover:bg-gray-100 transition-colors">{block.isExpanded ? <ChevronDown size={16} className="text-gray-600" /> : <ChevronRight size={16} className="text-gray-600" />}</button>
          <div className="flex-1">
            {isEditing && !readOnly ? (
              <input ref={inputRef as React.RefObject<HTMLInputElement>} type="text" value={block.content} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} placeholder={getPlaceholder()} className={`${commonInputClasses} text-gray-900 text-base leading-relaxed`} />
            ) : (
              <div onClick={handleClick} className={`w-full text-gray-900 text-base leading-relaxed min-h-[1.5rem] py-1 ${readOnlyClasses}`}>{block.content || <span className="text-gray-400">{getPlaceholder()}</span>}</div>
            )}
          </div>
        </div>
        {block.isExpanded && (
          <div className="ml-6 space-y-2">
            {childBlocks.map((childBlock) => <EditableBlock key={childBlock.id} block={childBlock} readOnly={readOnly} onContentChange={onContentChange} onKeyDown={onKeyDown} onToggleCheck={(checked) => onUpdateBlock({ checked })} onUpdateBlock={onUpdateBlock} />)}
            {!readOnly && <button onClick={handleAddChildBlock} className="text-gray-400 hover:text-gray-600 text-sm transition-colors">+ Add a block</button>}
          </div>
        )}
      </div>
    );
  };

  const renderDividerBlock = () => <hr className="border-gray-300 my-4" />;

  const renderCodeBlock = () => {
    const languages = [{ value: 'javascript', label: 'JavaScript' }, { value: 'python', label: 'Python' }, { value: 'typescript', label: 'TypeScript' }, { value: 'html', label: 'HTML' }, { value: 'css', label: 'CSS' }, { value: 'json', label: 'JSON' }, { value: 'plaintext', label: 'Plain Text' }];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Code Block</span>
          <select name="language" value={block.language || 'javascript'} onChange={handleChange} disabled={readOnly} className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
            {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
          </select>
        </div>
        <div className="bg-gray-100 rounded-lg p-4">
          <textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} value={block.content} onChange={handleChange} onKeyDown={handleKeyDown} onFocus={() => setIsEditing(true)} onBlur={handleBlur} placeholder="Enter your code here..." readOnly={readOnly} className={`${commonInputClasses} text-gray-900 text-sm font-mono leading-relaxed`} rows={Math.max(3, block.content.split('\n').length)} />
        </div>
      </div>
    );
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'heading': return renderHeadingBlock();
      case 'todo': return renderTodoBlock();
      case 'image': return renderImageBlock();
      case 'file': return renderFileBlock();
      case 'toggle': return renderToggleBlock();
      case 'divider': return renderDividerBlock();
      case 'code': return renderCodeBlock();
      default: return renderTextBlock();
    }
  };

  return (
    <div id={`block-${block.id}`} className={`group relative rounded-md transition-colors ${['divider', 'file'].includes(block.type) ? '' : `px-4 py-2 ${!readOnly && 'hover:bg-gray-50'}`} ${block.parentBlockId ? 'ml-4' : ''}`}>
      {renderBlock()}
    </div>
  );
};

export default EditableBlock;
