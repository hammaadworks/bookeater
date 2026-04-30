import { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Plus, MoreVertical, Edit3, FolderPlus, MessageSquarePlus, ChevronDown, ChevronRight } from 'lucide-react';
import { BookSession, Wrap } from '../../types/session';
import { SessionEditModal } from '../features/SessionEditModal';
import { WrapEditModal } from '../features/WrapEditModal';
import { APP_CONFIG } from '../../constants';

// Helper to get icon
const getIcon = (iconName: string = 'FileText', defaultIcon: string = 'FileText', size: number = 16) => {
  const Icon = (Icons as any)[iconName] || (Icons as any)[defaultIcon] || Icons.FileText;
  return <Icon size={size} className="shrink-0" />;
};

interface SidebarProps {
  sessions: BookSession[];
  wraps: Wrap[];
  currentSessionId: string | null;
  onSessionSelect: (id: string) => void;
  onSettingsClick: () => void;
  onNewSessionClick: (wrapId?: string) => void;
  onSessionUpdate: (id: string, updates: Partial<BookSession>) => void;
  onSessionDelete: (id: string) => void;
  onCreateWrap: (wrap: Omit<Wrap, 'id'>) => Promise<string>;
  onUpdateWrap: (id: string, updates: Partial<Wrap>) => void;
  onDeleteWrap: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  wraps,
  currentSessionId, 
  onSessionSelect, 
  onSettingsClick,
  onNewSessionClick,
  onSessionUpdate,
  onSessionDelete,
  onCreateWrap,
  onUpdateWrap,
  onDeleteWrap
}) => {
  const [editingSession, setEditingSession] = useState<BookSession | null>(null);
  const [editingWrap, setEditingWrap] = useState<Partial<Wrap> | null>(null);
  const [expandedWraps, setExpandedWraps] = useState<Record<string, boolean>>({});
  const [userName, setUserName] = useState('');
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  useEffect(() => {
    const updateName = () => setUserName(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_NAME) || '');
    updateName();
    window.addEventListener('storage', updateName);
    const interval = setInterval(updateName, 1000);
    return () => {
      window.removeEventListener('storage', updateName);
      clearInterval(interval);
    };
  }, []);

  const toggleWrap = (wrapId: string) => {
    setExpandedWraps(prev => ({
      ...prev,
      [wrapId]: !prev[wrapId]
    }));
  };

  // For long press
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (item: BookSession | Wrap, type: 'session' | 'wrap') => {
    timerRef.current = setTimeout(() => {
      if (type === 'session') setEditingSession(item as BookSession);
      else setEditingWrap(item as Wrap);
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleDragStart = (e: React.DragEvent, sessionId: string) => {
    e.dataTransfer.setData('text/plain', sessionId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverTarget(targetId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget as Node | null;
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, wrapId: string) => {
    e.preventDefault();
    setDragOverTarget(null);
    const sessionId = e.dataTransfer.getData('text/plain');
    if (sessionId) {
      onSessionUpdate(sessionId, { wrapId });
    }
  };

  const unwrappedSessions = sessions.filter(s => !s.wrapId || s.wrapId === 'default');

  const displayName = userName.trim() || 'Book Eater';
  const words = displayName.split(' ').filter(Boolean);
  const initials = words.length >= 2 
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : words[0].slice(0, 2).toUpperCase();

  const colors = ['bg-red-600', 'bg-orange-600', 'bg-amber-600', 'bg-green-600', 'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-sky-600', 'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-purple-600', 'bg-fuchsia-600', 'bg-pink-600', 'bg-rose-600'];
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const avatarColor = colors[Math.abs(hash) % colors.length];

  return (
    <>
      <nav className="w-[260px] bg-[#171717] text-zinc-300 flex flex-col h-full shrink-0 z-10 overflow-hidden font-sans">
        {/* Top Header / Logo */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 px-2 text-white font-semibold">
            <Icons.Brain size={24} className="text-white" />
            <span>BookEater</span>
          </div>
        </div>

        {/* New Book Button */}
        <div className="px-3 py-2">
          <button 
            onClick={() => onNewSessionClick()}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-[#202020] hover:bg-[#2A2A2A] active:scale-[0.98] transition-all rounded-xl text-white text-sm font-medium border border-[#2A2A2A]"
          >
            <div className="flex items-center gap-3">
              <MessageSquarePlus size={16} />
              <span>Add Book</span>
            </div>
            <Edit3 size={16} className="text-zinc-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          
          {/* Shelves / Wraps Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2 group">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Shelves
              </div>
              <button 
                onClick={() => setEditingWrap({})}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2A2A2A] rounded-md text-zinc-500 hover:text-white transition-all"
                title="New Shelf"
              >
                <FolderPlus size={14} />
              </button>
            </div>

            <div className="space-y-0.5">
              {wraps.map(wrap => {
                const wrapSessions = sessions.filter(s => s.wrapId === wrap.id);
                const isExpanded = !!expandedWraps[wrap.id];

                return (
                  <div 
                    key={wrap.id} 
                    className="flex flex-col"
                    onDragOver={(e) => handleDragOver(e, wrap.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, wrap.id)}
                  >
                    <div
                      className={`group relative w-full flex items-center px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] text-sm text-zinc-300 hover:bg-[#2A2A2A] cursor-pointer ${
                        dragOverTarget === wrap.id ? 'bg-[#2A2A2A] outline-dashed outline-2 outline-blue-500/50 outline-offset-[-2px]' : ''
                      }`}
                      onClick={() => toggleWrap(wrap.id)}
                      onTouchStart={() => handleTouchStart(wrap, 'wrap')}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchEnd}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setEditingWrap(wrap);
                      }}
                    >
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className={`${wrap.color || 'text-zinc-400'}`}>
                          {getIcon(wrap.icon, 'Folder', 16)}
                        </div>
                        <span className="truncate">{wrap.name}</span>
                      </div>
                      
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNewSessionClick(wrap.id);
                          }}
                          className="p-1 hover:bg-[#3A3A3A] rounded-md text-zinc-500 hover:text-white mr-1"
                          title="Add book to wrap"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWrap(wrap);
                          }}
                          className="p-1 hover:bg-[#3A3A3A] rounded-md text-zinc-500 hover:text-white"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                      <div className="text-zinc-500 ml-2 group-hover:hidden">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </div>

                    {/* Books inside wrap */}
                    {isExpanded && (
                      <div className="mt-1 mb-2 ml-4 pl-3 border-l border-[#2A2A2A] space-y-0.5">
                        {wrapSessions.length === 0 ? (
                          <div className="text-xs text-zinc-500 px-3 py-1 italic">Empty</div>
                        ) : (
                          wrapSessions.map(session => (
                            <div
                              key={session.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, session.id)}
                              className={`group relative w-full flex items-center px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] text-sm ${
                                currentSessionId === session.id 
                                  ? 'bg-[#2A2A2A] text-white font-medium' 
                                  : 'text-zinc-400 hover:bg-[#202020] hover:text-white'
                              }`}
                              onTouchStart={() => handleTouchStart(session, 'session')}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchEnd}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setEditingSession(session);
                              }}
                            >
                              <button
                                className="flex-1 flex flex-col min-w-0 text-left"
                                onClick={() => onSessionSelect(session.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`${session.color || 'text-zinc-400'}`}>
                                    {getIcon(session.icon, 'FileText', 16)}
                                  </div>
                                  <span className="truncate font-semibold text-base">{session.name}</span>
                                </div>
                                {session.bookName && (
                                  <span className="text-xs text-zinc-500 truncate ml-7 mt-0.5">{session.bookName}</span>
                                )}
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSession(session);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3A3A3A] rounded-md text-zinc-500 hover:text-white transition-all absolute right-2"
                              >
                                <MoreVertical size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recents Section */}
          <div 
            className={`mt-6 pb-12 min-h-[100px] rounded-xl transition-all ${dragOverTarget === 'default' ? 'bg-[#202020] outline-dashed outline-2 outline-blue-500/50 outline-offset-2' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverTarget('default');
            }}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'default')}
          >
            <div className="text-xs font-semibold text-zinc-500 mb-2 px-3">
              Recents
            </div>
            
            {unwrappedSessions.length === 0 && wraps.length === 0 && (
              <div className="text-sm text-zinc-500 px-3 italic">
                No books uploaded yet.
              </div>
            )}

            <div className="space-y-0.5">
              {unwrappedSessions.map(session => (
                <div
                  key={session.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, session.id)}
                  className={`group relative w-full flex items-center px-3 py-2 rounded-lg text-left transition-all active:scale-[0.98] text-sm ${
                    currentSessionId === session.id 
                      ? 'bg-[#2A2A2A] text-white font-medium' 
                      : 'text-zinc-300 hover:bg-[#202020] hover:text-white'
                  }`}
                  onTouchStart={() => handleTouchStart(session, 'session')}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setEditingSession(session);
                  }}
                >
                  <button
                    className="flex-1 flex flex-col min-w-0 text-left"
                    onClick={() => onSessionSelect(session.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${session.color || 'text-zinc-400'}`}>
                        {getIcon(session.icon, 'FileText', 16)}
                      </div>
                      <span className="truncate font-semibold text-base">{session.name}</span>
                    </div>
                    {session.bookName && (
                      <span className="text-xs text-zinc-500 truncate ml-7 mt-0.5">{session.bookName}</span>
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSession(session);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#3A3A3A] rounded-md text-zinc-500 hover:text-white transition-all absolute right-2"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile / Settings */}
        <div className="p-3 border-t border-[#2A2A2A]">
          <button 
            onClick={onSettingsClick}
            className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white transition-all active:scale-[0.98] rounded-xl hover:bg-[#202020] text-sm font-medium"
          >
            <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white shrink-0`}>
              {initials}
            </div>
            <span className="truncate">Settings</span>
          </button>
        </div>
      </nav>

      {/* Session Edit Modal */}
      <SessionEditModal 
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        session={editingSession}
        onSave={onSessionUpdate}
        onDelete={onSessionDelete}
      />

      {/* Wrap Edit Modal */}
      <WrapEditModal
        isOpen={!!editingWrap}
        onClose={() => setEditingWrap(null)}
        wrap={editingWrap}
        onSave={async (wrapData) => {
          if (editingWrap?.id) {
            onUpdateWrap(editingWrap.id, wrapData);
          } else {
            await onCreateWrap(wrapData);
          }
        }}
        onDelete={onDeleteWrap}
      />
    </>
  );
};