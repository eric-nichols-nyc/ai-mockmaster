import React from 'react';
import Link from 'next/link';
import { BotIcon } from 'lucide-react';
import { AuthDropdown } from './auth-dropdown';
const StickyHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white flex items-center">
          <BotIcon className="mr-2" />
          AI MockMaster
        </Link>
        <AuthDropdown />
      </div>
    </header>
  );
};

export default StickyHeader;
