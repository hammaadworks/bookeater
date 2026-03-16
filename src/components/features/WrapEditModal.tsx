import { useState, useEffect } from 'react';
import { X, Save, Trash2, Folder, FolderOpen, Briefcase, Heart, Coins, Circle, Square, Triangle } from 'lucide-react';
import { Wrap } from '../../types/session';

interface WrapEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  wrap: Partial<Wrap> | null;
  onSave: (wrapData: Omit<Wrap, 'id'>) => void;
  onDelete?: (id: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Folder', icon: Folder },
  { name: 'FolderOpen', icon: FolderOpen },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Heart', icon: Heart },
  { name: 'Coins', icon: Coins },
  { name: 'Circle', icon: Circle },
  { name: 'Square', icon: Square },
  { name: 'Triangle', icon: Triangle },
];

const AVAILABLE_COLORS = [
  { name: 'Default', value: 'text-zinc-400', bg: 'bg-zinc-400' },
  { name: 'Blue', value: 'text-blue-500', bg: 'bg-blue-500' },
  { name: 'Red', value: 'text-red-500', bg: 'bg-red-500' },
  { name: 'Green', value: 'text-green-500', bg: 'bg-green-500' },
  { name: 'Yellow', value: 'text-yellow-500', bg: 'bg-yellow-500' },
  { name: 'Purple', value: 'text-purple-500', bg: 'bg-purple-500' },
  { name: 'Pink', value: 'text-pink-500', bg: 'bg-pink-500' },
  { name: 'Indigo', value: 'text-indigo-500', bg: 'bg-indigo-500' },
];

export const WrapEditModal: React.FC<WrapEditModalProps> = ({
  isOpen,
  onClose,
  wrap,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [selectedColor, setSelectedColor] = useState('text-zinc-400');

  useEffect(() => {
    if (wrap) {
      setName(wrap.name || '');
      setSelectedIcon(wrap.icon || 'Folder');
      setSelectedColor(wrap.color || 'text-zinc-400');
    }
  }, [wrap]);

  if (!isOpen || !wrap) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });
    onClose();
  };

  const handleDelete = () => {
    if (wrap.id && onDelete) {
      if (confirm('Are you sure you want to delete this wrap? The books inside it will not be deleted, but they will be moved to Recents.')) {
        onDelete(wrap.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[#171717] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#2A2A2A]">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <h2 className="text-lg font-semibold tracking-tight text-white">{wrap.id ? 'Edit Wrap' : 'New Wrap'}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Wrap Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. History Books"
              className="w-full p-2.5 bg-[#2A2A2A] border border-[#3A3A3A] text-white rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => setSelectedIcon(name)}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                    selectedIcon === name 
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 border' 
                      : 'bg-[#2A2A2A] border-[#3A3A3A] text-zinc-400 hover:bg-[#3A3A3A] border'
                  }`}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Color</label>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${color.bg} ${
                    selectedColor === color.value ? 'ring-2 ring-offset-2 ring-offset-[#171717] ring-blue-500 scale-110' : 'hover:scale-110'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#2A2A2A] flex items-center justify-between bg-[#171717]">
          {wrap.id ? (
            <button 
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          ) : <div></div>}
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-[#2A2A2A] bg-[#171717] border border-[#3A3A3A] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors"
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