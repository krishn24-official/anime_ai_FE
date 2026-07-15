import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install banner/button
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed/standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, clear it
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[9999] bg-anime-bg/95 backdrop-blur-md border border-anime-border/45 p-5 rounded-2xl shadow-2xl flex flex-col space-y-3 animate-fade-in font-inter">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-anime-secondary to-anime-purple flex items-center justify-center text-white font-bold shrink-0">
            AI
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Install Anime AI</h4>
            <p className="text-[11px] text-anime-text/80">Add to home screen for offline access & app-like experience.</p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="p-1 hover:bg-white/5 rounded-lg text-anime-text/40 hover:text-white transition-all cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={handleInstallClick}
        className="w-full py-2.5 px-4 bg-[#62E7E0] text-[#0D0D0F] hover:bg-[#62E7E0]/90 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    </div>
  );
};

export default InstallPrompt;
