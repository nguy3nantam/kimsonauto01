import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function FloatingCTA() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showScrollTop) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all hover:scale-110"
        title="Lên đầu trang"
        aria-label="Lên đầu trang"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
}

