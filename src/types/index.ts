export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  avatar: string; // URL to avatar image or initials
  password?: string; // Made optional for security reasons on client-side representation
}

export interface Page {
  id:string;
  title: string;
  parentId: string | null;
  createdAt: Date;
  isExpanded?: boolean;
  icon?: string;
  creatorId: string;
  access: string[]; // Array of user IDs with access
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Block {
  id: string;
  type: 'text' | 'heading' | 'todo' | 'image' | 'toggle' | 'divider' | 'code' | 'file';
  content: string;
  checked?: boolean; // for todo type
  src?: string; // for image type
  language?: string; // for code type
  isExpanded?: boolean; // for toggle type
  children?: string[]; // for toggle type - array of child block IDs
  pageId: string;
  parentBlockId?: string; // for nested blocks
  // File block properties
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
}

export interface BlockType {
  type: 'text' | 'heading' | 'todo' | 'image' | 'toggle' | 'divider' | 'code' | 'file';
  label: string;
  icon: string;
  description: string;
}

// Template interfaces
export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: 'roadmap' | 'calendar';
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  category: 'Planning' | 'Design' | 'Development';
  startDate: string;
  endDate: string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  tag: string;
  color: string;
}
