import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, History as HistoryIcon, Video, BookOpen, Settings } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navItems = [
    { name: 'Home', icon: Home, page: 'Dashboard' },
    { name: 'Practice', icon: BookOpen, page: 'Practice' },
    { name: 'History', icon: HistoryIcon, page: 'History' },
    { name: 'Camera', icon: Video, page: 'Camera' },
  ];

  const isActive = (page) => {
    return location.pathname.includes(page);
  };

  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-16 sm:pb-0">
      {/* Top Bar with Logo */}
      <header 
        className={`fixed top-0 left-0 right-0 bg-white z-40 transition-all duration-300 ${
          isScrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <Link 
            to={createPageUrl('Dashboard')} 
            className="flex items-center space-x-3"
          >
            <div className="h-10 w-10 relative">
              <Image 
                src="/images/logo.png" 
                alt="Fencing Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-bold text-slate-900">FencePoint</span>
          </Link>
          <button 
            className="p-2 text-slate-500 hover:text-slate-700 focus:outline-none"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 px-4 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 shadow-lg sm:hidden">
        <div className="flex justify-around">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.page);
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${
                  active 
                    ? 'text-blue-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <div className={`p-2 rounded-full ${
                  active ? 'bg-blue-50' : ''
                }`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs mt-1">{item.name}</span>
                {active && (
                  <div className="h-1 w-6 bg-blue-600 rounded-full mt-1"></div>
                )}
              </Link>
            );
          })}
        </div>
        {/* Safe area for iPhone X and above */}
        <div className="h-4 bg-white sm:hidden"></div>
      </nav>
    </div>
  );
}