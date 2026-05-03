import Dexie, { Table } from 'dexie';
import { Lesson as LessonType } from '../types/lesson';
import { BookSession, Shelf } from '../types/session';

export interface LessonEntity {
  bookId: string;
  pageNumber: number;
  content: LessonType; // The AI output (JSON)
  pageSourceText?: string; // OCR'd or extracted text from the source page
  generatedAt: number;
}

export interface BookFile {
  id: string;          // Matches Book ID
  data: ArrayBuffer;   // Raw PDF
}

export class BookEaterDB extends Dexie {
  shelves!: Table<Shelf>;
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

    this.version(3).stores({
      shelves: 'id, name, updatedAt',
      books: 'id, shelfId, name, bookName, lastOpened'
    }).upgrade(async tx => {
      // Migrate wraps to shelves
      const wraps = await tx.table('wraps').toArray();
      await tx.table('shelves').bulkAdd(wraps);
      
      // Update shelfId in books
      await tx.table('books').toCollection().modify(book => {
        book.shelfId = book.wrapId || 'default';
        delete book.wrapId;
      });
    });
  }
}

export const db = new BookEaterDB();
