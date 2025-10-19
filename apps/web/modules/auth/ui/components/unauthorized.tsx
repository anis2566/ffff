import { ArrowLeft, Home, ShieldAlert } from "lucide-react";

export const UnAuthorizedView = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 px-8 py-8 text-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-pulse">
                <ShieldAlert className="w-12 h-12 text-white" strokeWidth={2} />
              </div>

              <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
                401
              </h1>
              <p className="text-2xl font-semibold text-white/90 mb-2">
                Unauthorized Access
              </p>
              <p className="text-blue-100 text-lg max-w-md mx-auto">
                You don't have permission to view this page. Please sign in to
                continue.
              </p>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Why am I seeing this?
                </h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>You may not be logged in to your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Your session may have expired</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>You don't have the required permissions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
