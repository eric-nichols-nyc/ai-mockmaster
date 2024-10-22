"use client";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { ArrowRightIcon } from "lucide-react";

const Hero: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex size-full bg-black">
      <div className="relative flex justify-center h-full w-full md:shadow-xl">
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <section
          className="relative flex items-center justify-center"
          style={{ height: "528px" }}
          data-testid="hero-section"
        >
          {/* Content */}
          <div className="relative z-10 w-full h-full flex flex-col justify-center items-start p-12">
            <div>
              <h1 className="text-5xl font-bold mb-6 text-white">
                AI-Powered Interview Practice
              </h1>
              <p className="text-xl mb-10 text-gray-200">
                Discover amazing features and benefits that will transform your
                experience.
              </p>
              {isSignedIn ? (
                <Link href="/dashboard">
                  <div className="z-10 flex items-center justify-center">
                    <div className="group rounded-full border border-black/5 bg-white text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                      <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400 font-semibold">
                        <span>✨ Go to dashboard</span>
                        <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                      </AnimatedShinyText>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <div className="z-10 flex min-h-64 items-center justify-center">
                    <div className="group rounded-full border border-black/5 bg-white text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                      <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400 font-semibold">
                        <span>✨ Get Started</span>
                        <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                      </AnimatedShinyText>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Hero;
