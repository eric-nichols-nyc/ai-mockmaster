import React from 'react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from '@/components/ui/button';

const StickyHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-black dark:text-white">
          AI MockMaster
        </Link>
        <nav className="flex items-center">
          <div className="ml-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button className=" text-white font-bold py-2 px-4 rounded">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default StickyHeader;