import { useState, useEffect } from 'react';
import { X, Save, Trash2, FileText, Book, BookOpen, Bookmark, BookMarked, BookCopy, Library, GraduationCap } from 'lucide-react';
import { BookSession } from '../../types/session';

interface SessionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: BookSession | null;
  onSave: (id: string, updates: Partial<BookSession>) => void;
  onDelete: (id: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'FileText', icon: FileText },
  { name: 'Book', icon: Book },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'BookMarked', icon: BookMarked },
  { name: 'BookCopy', icon: BookCopy },
  { name: 'Library', icon: Library },
  { name: 'GraduationCap', icon: GraduationCap },
];

const AVAILABLE_COLORS = [
  { name: 'Default', value: 'text-zinc-600', bg: 'bg-zinc-600' },
  { name: 'Blue', value: 'text-blue-500', bg: 'bg-blue-500' },
  { name: 'Red', value: 'text-red-500', bg: 'bg-red-500' },
  { name: 'Green', value: 'text-green-500', bg: 'bg-green-500' },
  { name: 'Purple', value: 'text-purple-500', bg: 'bg-purple-500' },
  { name: 'Orange', value: 'text-orange-500', bg: 'bg-orange-500' },
  { name: 'Pink', value: 'text-pink-500', bg: 'bg-pink-500' },
  { name: 'Indigo', value: 'text-indigo-500', bg: 'bg-indigo-500' },
];

export const SessionEditModal: React.FC<SessionEditModalProps> = ({
  isOpen,
  onClose,
  session,
  onSave,
  onDelete
}) => {
  const [sessionName, setSessionName] = useState('');
  const [bookName, setBookName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('FileText');
  const [selectedColor, setSelectedColor] = useState('text-zinc-600');

  useEffect(() => {
    if (session) {
      setSessionName(session.name || '');
      setBookName(session.bookName || '');
      setSelectedIcon(session.icon || 'FileText');
      setSelectedColor(session.color || 'text-zinc-600');
    }
  }, [session]);

  if (!isOpen || !session) return null;

  const handleSave = () => {
    onSave(session.id, {
      name: sessionName,
      bookName: bookName,
      icon: selectedIcon,
      color: selectedColor,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      onDelete(session.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold tracking-tight text-black">Edit Session</h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Session Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Session Name</label>
            <input 
              type="text" 
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g. Morning Reading"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          {/* Book Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Book Name</label>
            <input 
              type="text" 
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="e.g. Moby Dick"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => setSelectedIcon(name)}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                    selectedIcon === name 
                      ? 'bg-blue-50 border-blue-200 text-blue-600 border' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 border'
                  }`}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Color</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${color.bg} ${
                    selectedColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-110'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between bg-zinc-50">
          <button 
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-zinc-800 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
