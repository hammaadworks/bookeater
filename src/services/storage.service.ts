import { db, TokenUsage } from '../core/db';
import { BookSession, Shelf } from '../types/session';

/**
 * StorageService: A deep module for managing persistence.
 * Locality: All DB interactions for books, shelves, lessons, and usage tracking.
 */
export const StorageService = {
  // Session Operations
  async saveSession(session: BookSession, fileData: ArrayBuffer) {
    await db.transaction('rw', db.books, db.bookFiles, async () => {
      await db.bookFiles.put({ id: session.id, data: fileData });
      await db.books.put(session);
    });
  },

  async getSession(id: string) {
    return await db.books.get(id);
  },

  async deleteSession(id: string) {
    await db.transaction('rw', db.books, db.bookFiles, db.lessons, async () => {
      await db.books.delete(id);
      await db.bookFiles.delete(id);
      await db.lessons.where('bookId').equals(id).delete();
    });
  },

  async updateSession(id: string, updates: Partial<BookSession>) {
    await db.books.update(id, updates);
  },

  // Shelf Operations
  async saveShelf(shelf: Shelf) {
    await db.shelves.put(shelf);
    return shelf.id;
  },

  async deleteShelf(id: string) {
    await db.transaction('rw', db.shelves, db.books, db.bookFiles, db.lessons, async () => {
      await db.shelves.delete(id);
      const shelfBooks = await db.books.where('shelfId').equals(id).toArray();
      const bookIds = shelfBooks.map(b => b.id);
      await db.books.bulkDelete(bookIds);
      await db.bookFiles.bulkDelete(bookIds);
      for (const bId of bookIds) {
        await db.lessons.where('bookId').equals(bId).delete();
      }
    });
  },

  // Lesson/Cache Operations
  async getPageCache(bookId: string, pageNumber: number) {
    return await db.lessons.get([bookId, pageNumber]);
  },

  async savePageCache(bookId: string, pageNumber: number, content: any, sourceText?: string) {
    await db.lessons.put({
      bookId,
      pageNumber,
      content,
      pageSourceText: sourceText,
      generatedAt: Date.now()
    });
  },

  // Usage Tracking
  async saveTokenUsage(usage: TokenUsage) {
    return await db.tokenUsage.add(usage);
  },

  async getTokenUsage() {
    return await db.tokenUsage.orderBy('timestamp').reverse().toArray();
  },

  async clearUsage() {
    return await db.tokenUsage.clear();
  }
};
