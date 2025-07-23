import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Page, Workspace, Block, Template, RoadmapTask, CalendarEvent, User } from '../types';
import { useAuth } from '../auth/useAuth';

interface AppContextType {
  workspace: Workspace;
  pages: Page[];
  blocks: Block[];
  templates: Template[];
  selectedPageId: string | null;
  selectedTemplateId: string | null;
  roadmapTasks: RoadmapTask[];
  calendarEvents: CalendarEvent[];
  isSidebarCollapsed: boolean;
  canEditPage: (pageId: string) => boolean;
  updateWorkspaceName: (name: string) => void;
  updatePageTitle: (pageId: string, title: string) => void;
  updatePageIcon: (pageId: string, icon: string) => void;
  addPage: (parentId?: string) => void;
  deletePage: (pageId: string) => void;
  selectPage: (pageId: string) => void;
  selectTemplate: (templateId: string) => void;
  togglePageExpansion: (pageId: string) => void;
  toggleSidebar: () => void;
  getPageBlocks: (pageId: string) => Block[];
  getChildBlocks: (parentBlockId: string) => Block[];
  addBlock: (pageId: string, afterBlockId?: string, parentBlockId?: string) => Block | null;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  toggleBlockExpansion: (blockId: string) => void;
  // Page Access
  updatePageAccess: (pageId: string, userIds: string[]) => void;
  // Roadmap methods
  addRoadmapTask: (task: Omit<RoadmapTask, 'id'>) => void;
  updateRoadmapTask: (taskId: string, updates: Partial<RoadmapTask>) => void;
  deleteRoadmapTask: (taskId: string) => void;
  // Calendar methods
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (eventId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dummy data
const initialWorkspace: Workspace = {
  id: 'workspace-1',
  name: 'Kelas REY'
};

const initialPages: Page[] = [
  {
    id: 'page-1',
    title: 'Welcome Page',
    parentId: null,
    createdAt: new Date('2025-01-01'),
    isExpanded: true,
    icon: '👋',
    creatorId: 'user-1',
    access: ['user-1', 'user-2']
  },
  {
    id: 'page-2',
    title: 'Project A',
    parentId: null,
    createdAt: new Date('2025-01-02'),
    isExpanded: true,
    icon: '🚀',
    creatorId: 'user-1',
    access: ['user-1']
  },
  {
    id: 'page-3',
    title: 'Task List',
    parentId: 'page-2',
    createdAt: new Date('2025-01-03'),
    isExpanded: false,
    icon: '✅',
    creatorId: 'user-1',
    access: ['user-1']
  },
  {
    id: 'page-4',
    title: 'Meeting Notes',
    parentId: 'page-2',
    createdAt: new Date('2025-01-04'),
    isExpanded: false,
    icon: '📝',
    creatorId: 'user-2',
    access: ['user-2', 'user-1']
  },
  {
    id: 'page-5',
    title: 'Resources (Read-only for Bob)',
    parentId: null,
    createdAt: new Date('2025-01-05'),
    isExpanded: false,
    icon: '📚',
    creatorId: 'user-3',
    access: ['user-3', 'user-1']
  }
];

const initialTemplates: Template[] = [
  {
    id: 'template-roadmap',
    name: 'Roadmap',
    icon: '🗺️',
    description: 'Plan and track project milestones',
    type: 'roadmap'
  },
  {
    id: 'template-calendar',
    name: 'Calendar',
    icon: '📅',
    description: 'Organize events and deadlines',
    type: 'calendar'
  }
];

const initialRoadmapTasks: RoadmapTask[] = [];
const initialCalendarEvents: CalendarEvent[] = [];
const initialBlocks: Block[] = [
    { id: 'block-1', type: 'heading', content: 'Welcome to your enhanced workspace!', pageId: 'page-1' },
    { id: 'block-2', type: 'text', content: 'This page is editable by Admin Alice and User Bob.', pageId: 'page-1' },
    { id: 'block-8', type: 'heading', content: 'Project Overview', pageId: 'page-2' },
    { id: 'block-9', type: 'text', content: 'This page is only editable by Admin Alice.', pageId: 'page-2' }
];

const generateUniqueId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [templates] = useState<Template[]>(initialTemplates);
  const [selectedPageId, setSelectedPageId] = useState<string | null>('page-1');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>(initialRoadmapTasks);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const canEditPage = useMemo(() => (pageId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const page = pages.find(p => p.id === pageId);
    return page ? page.access.includes(currentUser.id) : false;
  }, [currentUser, pages]);

  const updateWorkspaceName = (name: string) => {
    if (currentUser?.role !== 'admin') return;
    setWorkspace(prev => ({ ...prev, name }));
  };

  const updatePageTitle = (pageId: string, title: string) => {
    if (!canEditPage(pageId)) return;
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, title } : page
    ));
  };

  const updatePageIcon = (pageId: string, icon: string) => {
    if (!canEditPage(pageId)) return;
    setPages(prev => prev.map(page =>
      page.id === pageId ? { ...page, icon } : page
    ));
  };

  const updatePageAccess = (pageId: string, userIds: string[]) => {
    if (!canEditPage(pageId)) return;
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, access: userIds } : page
    ));
  };

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  const addPage = (parentId?: string) => {
    if (!currentUser) return;
    // For sub-pages, check permission on parent
    if (parentId && !canEditPage(parentId)) return;

    const newPage: Page = {
      id: generateUniqueId('page'),
      title: 'Untitled',
      parentId: parentId || null,
      createdAt: new Date(),
      isExpanded: false,
      icon: '📄',
      creatorId: currentUser.id,
      access: [currentUser.id]
    };

    setPages(prev => {
      let updatedPages = [...prev, newPage];
      if (parentId) {
        updatedPages = updatedPages.map(page =>
          page.id === parentId ? { ...page, isExpanded: true } : page
        );
      }
      return updatedPages;
    });
    
    selectPage(newPage.id);
    const defaultBlock: Block = {
      id: generateUniqueId('block'), type: 'text', content: '', pageId: newPage.id
    };
    setBlocks(prev => [...prev, defaultBlock]);
  };

  const deletePage = (pageId: string) => {
    if (!canEditPage(pageId)) return;
    const descendantIds: string[] = [];
    const findDescendants = (parentId: string) => {
      pages.filter(p => p.parentId === parentId).forEach(child => {
        descendantIds.push(child.id);
        findDescendants(child.id);
      });
    };
    findDescendants(pageId);

    const idsToDelete = [pageId, ...descendantIds];
    const remainingPages = pages.filter(p => !idsToDelete.includes(p.id));
    setPages(remainingPages);
    setBlocks(prev => prev.filter(b => !idsToDelete.includes(b.pageId)));

    if (selectedPageId && idsToDelete.includes(selectedPageId)) {
      setSelectedPageId(remainingPages.length > 0 ? remainingPages[0].id : null);
    }
  };

  const selectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    setSelectedTemplateId(null);
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setSelectedPageId(null);
  };

  const togglePageExpansion = (pageId: string) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, isExpanded: !page.isExpanded } : page
    ));
  };

  const getPageBlocks = (pageId: string): Block[] => {
    return blocks.filter(block => block.pageId === pageId && !block.parentBlockId);
  };

  const getChildBlocks = (parentBlockId: string): Block[] => {
    return blocks.filter(block => block.parentBlockId === parentBlockId);
  };

  const addBlock = (pageId: string, afterBlockId?: string, parentBlockId?: string): Block | null => {
    if (!canEditPage(pageId)) return null;
    const newBlock: Block = {
      id: generateUniqueId('block'), type: 'text', content: '', pageId,
      ...(parentBlockId && { parentBlockId })
    };
    setBlocks(prev => {
      let newBlocks = [...prev];
      if (afterBlockId) {
        const index = newBlocks.findIndex(b => b.id === afterBlockId) + 1;
        newBlocks.splice(index, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }
      if (parentBlockId) {
        newBlocks = newBlocks.map(b => b.id === parentBlockId ? { ...b, children: [...(b.children || []), newBlock.id] } : b);
      }
      return newBlocks;
    });
    return newBlock;
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !canEditPage(block.pageId)) return;
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, ...updates } : b));
  };

  const deleteBlock = (blockId: string) => {
    const blockToDelete = blocks.find(b => b.id === blockId);
    if (!blockToDelete || !canEditPage(blockToDelete.pageId)) return;
    
    if (blockToDelete.type === 'toggle' && blockToDelete.children) {
      setBlocks(prev => prev.filter(b => b.id !== blockId && !blockToDelete.children?.includes(b.id)));
    } else {
      setBlocks(prev => prev.filter(b => b.id !== blockId));
    }

    if (blockToDelete.parentBlockId) {
      setBlocks(prev => prev.map(b => 
        b.id === blockToDelete.parentBlockId ? { ...b, children: b.children?.filter(id => id !== blockId) } : b
      ));
    }
  };

  const toggleBlockExpansion = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !canEditPage(block.pageId)) return;
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, isExpanded: !b.isExpanded } : b));
  };

  // Roadmap methods (permission checks can be added if needed)
  const addRoadmapTask = (task: Omit<RoadmapTask, 'id'>) => setRoadmapTasks(prev => [...prev, { ...task, id: generateUniqueId('task') }]);
  const updateRoadmapTask = (taskId: string, updates: Partial<RoadmapTask>) => setRoadmapTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  const deleteRoadmapTask = (taskId: string) => setRoadmapTasks(prev => prev.filter(t => t.id !== taskId));

  // Calendar methods (permission checks can be added if needed)
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => setCalendarEvents(prev => [...prev, { ...event, id: generateUniqueId('event') }]);
  const updateCalendarEvent = (eventId: string, updates: Partial<CalendarEvent>) => setCalendarEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e));
  const deleteCalendarEvent = (eventId: string) => setCalendarEvents(prev => prev.filter(e => e.id !== eventId));

  return (
    <AppContext.Provider value={{
      workspace, pages, blocks, templates, selectedPageId, selectedTemplateId, roadmapTasks, calendarEvents, isSidebarCollapsed,
      canEditPage, updateWorkspaceName, updatePageTitle, updatePageIcon, addPage, deletePage, selectPage, selectTemplate,
      togglePageExpansion, toggleSidebar, getPageBlocks, getChildBlocks, addBlock, updateBlock, deleteBlock, toggleBlockExpansion,
      updatePageAccess, addRoadmapTask, updateRoadmapTask, deleteRoadmapTask, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
