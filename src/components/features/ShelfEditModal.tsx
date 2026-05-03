import React, { useState, useEffect } from 'react';
import { X, Trash2, Folder, Book, Bookmark, Star, Heart, GraduationCap, Brain, Lightbulb, Coffee, Target, Zap, Rocket, Globe, Music, Palette, Code, Cpu, Database, Shield, Trophy, Mountain, TreePine, Leaf, Languages } from 'lucide-react';
import { Shelf } from '../../types/session';

interface ShelfEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelf: Partial<Shelf> | null;
  onSave: (shelfData: Omit<Shelf, 'id'>) => void;
  onDelete?: (id: string) => void;
}

const icons = [
  { name: 'Folder', icon: <Folder size={20} /> },
  { name: 'Book', icon: <Book size={20} /> },
  { name: 'Bookmark', icon: <Bookmark size={20} /> },
  { name: 'Star', icon: <Star size={20} /> },
  { name: 'Heart', icon: <Heart size={20} /> },
  { name: 'GraduationCap', icon: <GraduationCap size={20} /> },
  { name: 'Brain', icon: <Brain size={20} /> },
  { name: 'Lightbulb', icon: <Lightbulb size={20} /> },
  { name: 'Coffee', icon: <Coffee size={20} /> },
  { name: 'Target', icon: <Target size={20} /> },
  { name: 'Zap', icon: <Zap size={20} /> },
  { name: 'Rocket', icon: <Rocket size={20} /> },
  { name: 'Globe', icon: <Globe size={20} /> },
  { name: 'Languages', icon: <Languages size={20} /> },
  { name: 'Code', icon: <Code size={20} /> },
  { name: 'Cpu', icon: <Cpu size={20} /> },
  { name: 'Database', icon: <Database size={20} /> },
  { name: 'Shield', icon: <Shield size={20} /> },
  { name: 'Trophy', icon: <Trophy size={20} /> },
  { name: 'Mountain', icon: <Mountain size={20} /> },
  { name: 'TreePine', icon: <TreePine size={20} /> },
  { name: 'Leaf', icon: <Leaf size={20} /> },
  { name: 'Music', icon: <Music size={20} /> },
  { name: 'Palette', icon: <Palette size={20} /> },
];

const colors = [
  { name: 'Gray', value: 'text-zinc-400', bg: 'bg-zinc-400' },
  { name: 'Red', value: 'text-red-400', bg: 'bg-red-400' },
  { name: 'Orange', value: 'text-orange-400', bg: 'bg-orange-400' },
  { name: 'Amber', value: 'text-amber-400', bg: 'bg-amber-400' },
  { name: 'Yellow', value: 'text-yellow-400', bg: 'bg-yellow-400' },
  { name: 'Lime', value: 'text-lime-400', bg: 'bg-lime-400' },
  { name: 'Green', value: 'text-green-400', bg: 'bg-green-400' },
  { name: 'Emerald', value: 'text-emerald-400', bg: 'bg-emerald-400' },
  { name: 'Teal', value: 'text-teal-400', bg: 'bg-teal-400' },
  { name: 'Cyan', value: 'text-cyan-400', bg: 'bg-cyan-400' },
  { name: 'Sky', value: 'text-sky-400', bg: 'bg-sky-400' },
  { name: 'Blue', value: 'text-blue-400', bg: 'bg-blue-400' },
  { name: 'Indigo', value: 'text-indigo-400', bg: 'bg-indigo-400' },
  { name: 'Violet', value: 'text-violet-400', bg: 'bg-violet-400' },
  { name: 'Purple', value: 'text-purple-400', bg: 'bg-purple-400' },
  { name: 'Fuchsia', value: 'text-fuchsia-400', bg: 'bg-fuchsia-400' },
  { name: 'Pink', value: 'text-pink-400', bg: 'bg-pink-400' },
  { name: 'Rose', value: 'text-rose-400', bg: 'bg-rose-400' },
];

export const ShelfEditModal: React.FC<ShelfEditModalProps> = ({
  isOpen,
  onClose,
  shelf,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [selectedColor, setSelectedColor] = useState('text-zinc-400');

  useEffect(() => {
    if (shelf) {
      setName(shelf.name || '');
      setSelectedIcon(shelf.icon || 'Folder');
      setSelectedColor(shelf.color || 'text-zinc-400');
    }
  }, [shelf]);

  if (!isOpen || !shelf) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        createdAt: shelf.createdAt || Date.now(),
        updatedAt: Date.now()
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (shelf.id && onDelete) {
      if (confirm('Are you sure you want to delete this shelf? The books inside it will not be deleted, but they will be moved to Recents.')) {
        onDelete(shelf.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex items-center justify-between border-b border-[#333]">
          <h2 className="text-lg font-semibold tracking-tight text-white">{shelf.id ? 'Edit Shelf' : 'New Shelf'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#333] transition-colors text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Shelf Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Machine Learning, Psychology..."
              className="w-full bg-[#2A2A2A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon.name}
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                    selectedIcon === icon.name 
                      ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/50' 
                      : 'bg-[#2A2A2A] text-zinc-400 hover:bg-[#333] hover:text-white'
                  }`}
                >
                  {icon.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Color</label>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full transition-all ${color.bg} ${
                    selectedColor === color.value 
                      ? 'ring-4 ring-white/20 ring-offset-2 ring-offset-[#1A1A1A] scale-110' 
                      : 'hover:scale-110'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#252525] border-t border-[#333] flex items-center justify-between">
          {shelf.id ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
            >
              <Trash2 size={16} />
              Delete Shelf
            </button>
          ) : <div />}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
