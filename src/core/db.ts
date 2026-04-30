import Dexie, { Table } from 'dexie';
import { Lesson as LessonType } from '../types/lesson';
import { BookSession, Wrap } from '../types/session';

export interface LessonEntity {
  bookId: string;
  pageNumber: number;
  content: LessonType; // The AI output (JSON)
  generatedAt: number;
}

export interface BookFile {
  id: string;          // Matches Book ID
  data: ArrayBuffer;   // Raw PDF
}

export class BookEaterDB extends Dexie {
  wraps!: Table<Wrap>;
  books!: Table<BookSession>;
  lessons!: Table<LessonEntity>;
  bookFiles!: Table<BookFile>;

  constructor() {
    super('BookEaterDB');
    
    this.version(1).stores({
      wraps: 'id, name, updatedAt',
      books: 'id, wrapId, name, lastOpened',
      lessons: '[bookId+pageNumber], bookId',
      bookFiles: 'id'
    });

    this.version(2).stores({
      books: 'id, wrapId, name, bookName, lastOpened'
    });
  }
}

export const db = new BookEaterDB();
