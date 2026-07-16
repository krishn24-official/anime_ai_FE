import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export const PwaUpdater: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 left-6 right-6 md:left-auto md:right-6 md:w-80 z-[9999] bg-anime-bg/95 backdrop-blur-md border border-[#62E7E0]/45 p-4 rounded-2xl shadow-2xl flex flex-col space-y-3 animate-fade-in font-inter">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#62E7E0]" />
            Update Available
          </h4>
          <p className="text-[11px] text-anime-text/80 mt-1">A new version of AniVerse is ready.</p>
        </div>
        <button 
          onClick={() => setNeedRefresh(false)}
          className="p-1 hover:bg-white/5 rounded-lg text-anime-text/40 hover:text-white transition-all cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={() => updateServiceWorker(true)}
        className="w-full py-2 px-4 bg-[#62E7E0] text-[#0D0D0F] hover:bg-[#62E7E0]/90 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center cursor-pointer"
      >
        Refresh App
      </button>
    </div>
  );
};

export default PwaUpdater;
