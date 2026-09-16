import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export default function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu if the user clicks anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={menuRef}>

      {/* The Dark Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-64 bg-[#1e1e1e] text-gray-300 text-sm rounded-xl shadow-2xl border border-gray-700 py-2 mb-2">
          <div className="flex flex-col">
            <a href="#" className="px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors">Learn about QuickBite</a>
            <a href="#" className="px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors">Help Center</a>
            <a href="#" className="px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors">Support Forum</a>
            <a href="#" className="px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors">Video Tutorials</a>

            <div className="h-px bg-gray-700 my-2"></div>

            <a href="#" className="px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors">Ask the community</a>
            <a href="#" className="px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors">Contact support</a>

            <div className="h-px bg-gray-700 my-2"></div>

            <a href="#" className="px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors">Keyboard shortcuts</a>
          </div>
        </div>
      )}

      {/* The Circular Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-[#1e1e1e] hover:bg-black text-gray-400 hover:text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        <HelpCircle size={24} fill="currentColor" className="text-[#1e1e1e] bg-gray-300 rounded-full border border-transparent" />
      </button>
    </div>
  );
}
