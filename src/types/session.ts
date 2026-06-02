export type SourceType = 'file' | 'youtube' | 'local-video';

export interface BookSession {
  id: string;          // UUID
  shelfId: string;     // Parent Shelf ID (can be 'default' if not on a shelf)
  name: string;
  sourceType?: SourceType;
  sourceUrl?: string;  // For YouTube or local blob references
  bookName?: string;   // The original file name or source title
  author?: string;
  totalPages: number;
  currentPage: number; // Current progress
  lastOpened: number;  // For "Recent" sorting
  color?: string;
  icon?: string;
  metadata?: any;
}

export interface Shelf {
  id: string;          // UUID
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;   // For sorting
}
