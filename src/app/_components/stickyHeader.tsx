"use client"
import React from 'react';
import Link from 'next/link';
import { BotIcon } from 'lucide-react';
import { AuthDropdown } from './auth-dropdown';
import { useAuth } from '@clerk/nextjs';

const StickyHeader: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-primary to-primary/90 backdrop-blur-sm shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link 
          href="/" 
          className="text-2xl font-bold text-white flex items-center group transition-all duration-300 ease-in-out"
        >
          <BotIcon className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
          <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
            AI MockMaster
          </span>
        </Link>
        <nav className="flex items-center space-x-6">
          {isSignedIn && (
            <>
              <Link 
                href="/dashboard" 
                className="text-white/90 hover:text-white font-medium px-4 py-2 rounded-full 
                          hover:bg-white/10 transition-all duration-300 ease-in-out
                          active:scale-95"
              >
                Dashboard
              </Link>
              <Link 
                href="/account" 
                className="text-white/90 hover:text-white font-medium px-4 py-2 rounded-full 
                          hover:bg-white/10 transition-all duration-300 ease-in-out
                          active:scale-95"
              >
                Account
              </Link>
              <div className="pl-2 border-l border-white/20">
                <AuthDropdown />
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default StickyHeader;
