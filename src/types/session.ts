export interface BookSession {
  id: string;          // UUID
  wrapId: string;      // Parent Wrap ID (can be 'default' if not in a wrap)
  name: string;
  bookName?: string;   // The original file name
  author?: string;
  totalPages: number;
  currentPage: number; // Current progress
  lastOpened: number;  // For "Recent" sorting
  color?: string;
  icon?: string;
  metadata?: any;
}

export interface Wrap {
  id: string;          // UUID
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;   // For sorting
}
