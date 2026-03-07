'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Bell, ChevronDown, LogIn } from 'lucide-react';
import { useSession, signOut, signIn } from 'next-auth/react';

const UserProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>;
  }

  if (status === 'unauthenticated') {
    return (
      <button
        onClick={() => signIn()}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
      >
        <LogIn size={16} />
        <span>Sign In</span>
      </button>
    );
  }

  const user = session?.user;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-white/20 shadow-sm">
          {user?.image ? (
            <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0) || 'U'
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{user?.name}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Free Plan</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <User size={16} className="text-slate-400" />
            <span>My Profile</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <Settings size={16} className="text-slate-400" />
            <span>Account Settings</span>
          </button>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>

          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
