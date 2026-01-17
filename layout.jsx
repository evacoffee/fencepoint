import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, History, Video, BookOpen } from 'lucide-react';
import Image from 'next/image';

export default function Layout({ children }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Practice', icon: BookOpen, page: 'Practice' },
    { name: 'History', icon: History, page: 'History' },
    { name: 'Camera', icon: Video, page: 'Camera' },
  ];

  const isActive = (page) => {
    return location.pathname.includes(page);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar with Logo */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-16 relative">
              <Image 
                src="/images/logo.png" 
                alt="Fencing Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-slate-900">FencePoint</span>
          </div>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 sm:hidden">
        <div className="flex justify-around py-2">
          {navItems.map(item => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                isActive(item.page)
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main content with bottom padding for mobile nav */}
      <div className="pb-20 sm:pb-0">
        {children}
      </div>
    </div>
  );
}