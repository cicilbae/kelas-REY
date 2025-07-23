import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../auth/useAuth';
import BlockEditor from './BlockEditor';
import RoadmapTemplate from './templates/RoadmapTemplate';
import CalendarTemplate from './templates/CalendarTemplate';
import IconPicker from './IconPicker';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { SmilePlus, Users, Lock } from 'lucide-react';
import AvatarStack from './auth/AvatarStack';
import ManageAccessModal from './ManageAccessModal';

const MainContent: React.FC = () => {
  const { pages, templates, selectedPageId, selectedTemplateId, isSidebarCollapsed, updatePageIcon, canEditPage } = useApp();
  const { users } = useAuth();
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useOnClickOutside(iconPickerRef, () => setIsIconPickerOpen(false), iconButtonRef);

  if (selectedTemplateId) {
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (selectedTemplate?.type === 'roadmap') return <RoadmapTemplate />;
    if (selectedTemplate?.type === 'calendar') return <CalendarTemplate />;
  }

  const selectedPage = pages.find(page => page.id === selectedPageId);

  if (!selectedPage) {
    return (
      <div className={`flex-1 flex items-center justify-center bg-white transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-0' : ''}`}>
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No page selected</p>
          <p className="text-sm">Select a page from the sidebar to get started</p>
        </div>
      </div>
    );
  }

  const hasEditAccess = canEditPage(selectedPage.id);
  const usersWithAccess = users.filter(u => selectedPage.access.includes(u.id));

  const handleIconSelect = (icon: string) => {
    if (hasEditAccess) {
      updatePageIcon(selectedPage.id, icon);
    }
    setIsIconPickerOpen(false);
  };

  return (
    <div className={`flex-1 bg-white transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-0' : ''}`}>
      {isAccessModalOpen && <ManageAccessModal page={selectedPage} onClose={() => setIsAccessModalOpen(false)} />}
      
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-start mb-4">
          <div className="relative">
            <button
              ref={iconButtonRef}
              onClick={() => setIsIconPickerOpen(prev => !prev)}
              disabled={!hasEditAccess}
              className="hover:bg-gray-100 rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              {selectedPage.icon ? (
                <span className="text-5xl">{selectedPage.icon}</span>
              ) : (
                <div className="flex items-center text-gray-400 p-2">
                  <SmilePlus size={24} className="mr-2" />
                  <span className="text-sm font-medium">Add Icon</span>
                </div>
              )}
            </button>
            {isIconPickerOpen && (
              <div ref={iconPickerRef} className="absolute top-full mt-2 z-50">
                <IconPicker onSelect={handleIconSelect} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <AvatarStack users={usersWithAccess} />
            <button
              onClick={() => setIsAccessModalOpen(true)}
              disabled={!hasEditAccess}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasEditAccess ? <Users size={16} /> : <Lock size={16} />}
              <span>{hasEditAccess ? 'Share' : 'View Only'}</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {selectedPage.title}
        </h1>
        <p className="text-sm text-gray-500">
          Created on {selectedPage.createdAt.toLocaleDateString()}
        </p>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        <BlockEditor key={selectedPage.id} pageId={selectedPage.id} readOnly={!hasEditAccess} />
      </div>
    </div>
  );
};

export default MainContent;
