"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';

const Hero: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <section className="hero flex bg-gradient-to-r from-blue-200 to-cyan-200" style={{ height: '528px' }} data-testid="hero-section">
      {/* Right side - Content */}
      <div className={`w-1/2 flex flex-col justify-center items-start p-12`}>
        <h1 className="text-5xl font-bold mb-6 text-gray-800 dark:text-white">AI-Powered Interview Practice</h1>
        <p className="text-xl mb-10 text-gray-600 dark:text-gray-300">Discover amazing features and benefits that will transform your experience.</p>
        {isSignedIn ? (
          <Link href="/dashboard">
            <Button className="text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
              Go to Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/sign-in">
            <Button className="text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
              Get Started
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
};

export default Hero;
