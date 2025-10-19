"use client";

import { RefreshCw, ServerCrash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const ErrorView = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl px-12 py-6 text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 mb-8 shadow-xl relative">
            <ServerCrash className="w-14 h-14 text-white" strokeWidth={2} />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full"></div>
          </div>

          <div className="mb-4">
            <div className="inline-block px-4 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-full mb-4">
              500 Error
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">
            Something Went Wrong
          </h1>

          <p className="text-gray-600 text-lg mb-4 leading-relaxed max-w-xl mx-auto">
            An unexpected error occurred on our servers. Our team has been
            notified and is working to fix the issue.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-4 border border-gray-200">
            <div className="flex items-start gap-3 text-left">
              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-gray-700 break-all">
                  Error ID:{" "}
                  <span className="text-red-600 font-semibold">
                    ERR_500_INTERNAL_SERVER
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Timestamp: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition-all duration-300"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Retry
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:scale-105 transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};
