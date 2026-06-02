import React, { useState, useEffect, useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

type SnapPoint = 'closed' | 'half' | 'full';

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children }) => {
  const [snapPoint, setSnapPoint] = useState<SnapPoint>('closed');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (isOpen && snapPoint === 'closed') {
      setSnapPoint('half');
    } else if (!isOpen) {
      setSnapPoint('closed');
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    currentY.current = clientY;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    currentY.current = clientY;
    const delta = currentY.current - startY.current;
    
    // Prevent dragging up past 'full'
    if (snapPoint === 'full' && delta < 0) return;
    
    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Determine new snap point based on drag distance and direction
    const threshold = 100; // pixels
    
    if (snapPoint === 'half') {
      if (dragOffset < -threshold) {
        setSnapPoint('full');
      } else if (dragOffset > threshold) {
        setSnapPoint('closed');
        onClose();
      }
    } else if (snapPoint === 'full') {
      if (dragOffset > threshold) {
        setSnapPoint('half');
      }
    }

    setDragOffset(0);
  };

  const getTranslateY = () => {
    if (snapPoint === 'closed') return '100%';
    if (snapPoint === 'full') return `calc(0% + ${dragOffset > 0 ? dragOffset : 0}px)`;
    if (snapPoint === 'half') return `calc(50% + ${dragOffset}px)`;
    return '100%';
  };

  if (snapPoint === 'closed' && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {snapPoint === 'full' && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 md:hidden"
          onClick={() => setSnapPoint('half')}
        />
      )}
      
      {/* Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col md:hidden overflow-hidden ${
          isDragging ? 'transition-none' : 'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'
        }`}
        style={{ 
          height: '90vh', // Maximum height it can occupy
          transform: `translateY(${getTranslateY()})`
        }}
      >
        {/* Drag Handle Area */}
        <div 
          className="w-full h-8 flex items-center justify-center cursor-grab active:cursor-grabbing bg-white shrink-0 pt-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto bg-white pb-safe">
          {children}
        </div>
      </div>
    </>
  );
};
