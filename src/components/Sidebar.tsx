import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, FileText, Menu, X, Trash2, LogOut, Settings, UserCog } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/useAuth';
import { Page } from '../types';
import UserAvatar from './auth/UserAvatar';
import SettingsModal from './auth/SettingsModal';
import AdminPanelModal from './auth/AdminPanelModal';

const Sidebar: React.FC = () => {
  const { 
    workspace, pages, selectedPageId, isSidebarCollapsed,
    updatePageTitle, addPage, deletePage, selectPage, togglePageExpansion,
    toggleSidebar, canEditPage
  } = useApp();
  const { currentUser, logout } = useAuth();
  
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const handlePageTitleEdit = (page: Page) => {
    if (!isSidebarCollapsed && canEditPage(page.id)) {
      setEditingPageId(page.id);
      setEditingPageTitle(page.title);
    }
  };

  const handlePageTitleSubmit = () => {
    if (editingPageId && editingPageTitle.trim()) {
      updatePageTitle(editingPageId, editingPageTitle.trim());
    }
    setEditingPageId(null);
    setEditingPageTitle('');
  };

  const handlePageTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePageTitleSubmit();
    else if (e.key === 'Escape') setEditingPageId(null);
  };

  const handleDeletePage = (page: Page) => {
    if (window.confirm(`Are you sure you want to delete "${page.title}" and all its sub-pages?`)) {
      deletePage(page.id);
    }
  };

  const getChildPages = (parentId: string | null): Page[] => pages.filter(page => page.parentId === parentId);
  const hasChildren = (pageId: string): boolean => pages.some(page => page.parentId === pageId);

  const renderPage = (page: Page, level: number = 0) => {
    const children = getChildPages(page.id);
    const hasChildPages = hasChildren(page.id);
    const isSelected = selectedPageId === page.id;
    const isExpanded = page.isExpanded;
    const isEditing = editingPageId === page.id;
    const hasEditAccess = canEditPage(page.id);

    if (isSidebarCollapsed && level > 0) return null;

    return (
      <div key={page.id} className="select-none">
        <div
          className={`flex items-center py-1 px-2 rounded-md cursor-pointer group transition-colors ${isSelected ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
          style={{ paddingLeft: isSidebarCollapsed ? '8px' : `${level * 16 + 8}px` }}
          onClick={() => !isEditing && selectPage(page.id)}
          title={isSidebarCollapsed ? page.title : undefined}
        >
          <div className="flex items-center flex-1 min-w-0">
            {!isSidebarCollapsed && hasChildPages ? (
              <button className="p-0.5 rounded hover:bg-slate-700 mr-1 flex-shrink-0" onClick={(e) => { e.stopPropagation(); togglePageExpansion(page.id); }}>
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            ) : <div className={`${isSidebarCollapsed ? 'w-0' : 'w-5'} flex-shrink-0`} />}
            
            {page.icon ? <span className="mr-2 text-sm flex-shrink-0">{page.icon}</span> : <FileText size={14} className="mr-2 flex-shrink-0 text-gray-400" />}
            
            {!isSidebarCollapsed && (
              isEditing ? (
                <input type="text" value={editingPageTitle} onChange={(e) => setEditingPageTitle(e.target.value)} onBlur={handlePageTitleSubmit} onKeyDown={handlePageTitleKeyPress} className="flex-1 px-1 py-0.5 text-sm bg-slate-900 border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-white" autoFocus onClick={(e) => e.stopPropagation()} />
              ) : (
                <span className={`truncate text-sm px-1 py-0.5 rounded flex-1 ${hasEditAccess ? 'hover:bg-slate-800' : 'cursor-default'}`} onClick={(e) => { e.stopPropagation(); handlePageTitleEdit(page); }}>
                  {page.title}
                </span>
              )
            )}
          </div>
          
          <div className="flex items-center ml-auto pl-1">
            {!isSidebarCollapsed && !isEditing && hasEditAccess && (
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); addPage(page.id); }} title="Add sub-page" className="p-1 rounded hover:bg-slate-700"><Plus size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDeletePage(page); }} title="Delete page" className="p-1 rounded hover:bg-slate-700 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            )}
          </div>
        </div>
        
        {!isSidebarCollapsed && hasChildPages && isExpanded && <div>{children.map(child => renderPage(child, level + 1))}</div>}
      </div>
    );
  };

  const rootPages = getChildPages(null);

  return (
    <>
      {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
      {isAdminPanelOpen && <AdminPanelModal onClose={() => setIsAdminPanelOpen(false)} />}
      
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-700 h-screen flex flex-col transition-all duration-300 ease-in-out`}>
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-md flex items-center justify-center font-bold text-white text-lg flex-shrink-0">R</div>
            {!isSidebarCollapsed && <h1 className="text-lg font-bold text-gray-100 truncate">{workspace.name}</h1>}
          </div>
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-slate-700 transition-colors text-gray-400" title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {isSidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          <div>
            {!isSidebarCollapsed && <div className="flex items-center py-1 px-2 mb-2"><span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Pages</span></div>}
            <div className="space-y-1">{rootPages.map(page => renderPage(page))}</div>
          </div>
        </div>

        <div className="p-2 border-t border-slate-700 space-y-1">
          <button onClick={() => addPage()} className={`w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-slate-800 hover:text-white rounded-md transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`} title={isSidebarCollapsed ? 'Add Page' : undefined}>
            <Plus size={16} className={isSidebarCollapsed ? '' : 'mr-2'} />
            {!isSidebarCollapsed && 'Add Page'}
          </button>

          {currentUser?.role === 'admin' && (
            <button onClick={() => setIsAdminPanelOpen(true)} className={`w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-slate-800 hover:text-white rounded-md transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`} title={isSidebarCollapsed ? 'Admin Panel' : undefined}>
              <UserCog size={16} className={isSidebarCollapsed ? '' : 'mr-2'} />
              {!isSidebarCollapsed && 'Admin Panel'}
            </button>
          )}

          {currentUser && (
            <div className={`flex items-center gap-3 p-2 rounded-md ${isSidebarCollapsed ? 'justify-center flex-col space-y-2' : ''}`}>
              <UserAvatar user={currentUser} size="sm" />
              {!isSidebarCollapsed && <span className="text-sm text-gray-300 truncate font-medium flex-1">{currentUser.name}</span>}
              <div className="flex items-center">
                <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-slate-700" title="Settings"><Settings size={16} /></button>
                <button onClick={logout} className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-slate-700" title="Log Out"><LogOut size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
