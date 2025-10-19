"use client";

import Image from "next/image";

import { cn } from "@workspace/ui/lib/utils";

interface LoaderProps {
  className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
  return (
    <div
      className={cn(
        "min-h-[85vh] bg-transparent backdrop-blur[1px] flex items-center justify-center",
        className
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* Rotating Circles Container - Further reduced to w-16 h-16 */}
        <div className="relative w-16 h-16">
          {/* First Circle - Faster rotation */}
          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "2s" }}
          >
            <div className="w-full h-full border-2 border-transparent border-t-blue-600 border-r-blue-400 rounded-full"></div>
          </div>

          {/* Second Circle - Faster reverse rotation */}
          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "2s", animationDirection: "reverse" }}
          >
            <div className="w-full h-full border-2 border-transparent border-b-emerald-500 border-l-emerald-300 rounded-full"></div>
          </div>

          {/* Inner Circle with faster rotation */}
          <div
            className="absolute inset-2 animate-spin"
            style={{ animationDuration: "3s" }}
          >
            <div className="w-full h-full border border-transparent border-t-indigo-400 border-b-cyan-400 rounded-full"></div>
          </div>

          {/* Logo Container - Further reduced padding */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-1.5 shadow-md border border-slate-100">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-4 h-4 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Brand Name - Further reduced text size */}
        <div className="text-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent mb-1">
            BEC
          </h1>
        </div>

        {/* Loading Dots - Faster pulse animation */}
        <div className="flex space-x-1">
          <div
            className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: "0s", animationDuration: "1s" }}
          ></div>
          <div
            className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s", animationDuration: "1s" }}
          ></div>
          <div
            className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s", animationDuration: "1s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
