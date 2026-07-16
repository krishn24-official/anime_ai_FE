import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Share } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIosPromptVisible, setIsIosPromptVisible] = useState(false);

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
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsVisible(false);
      setIsIosPromptVisible(false);
    } else {
      // Check for iOS Safari
      const ua = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(ua);
      const isSafari = /safari/.test(ua) && !/chrome|crios|fxios|opios|edgios/.test(ua);
      
      if (isIos && isSafari && !localStorage.getItem('iosInstallDismissed')) {
        setIsIosPromptVisible(true);
      }
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

  const handleIosDismiss = () => {
    setIsIosPromptVisible(false);
    localStorage.setItem('iosInstallDismissed', 'true');
  };

  if (!isVisible && !isIosPromptVisible) return null;

  if (isIosPromptVisible) {
    return (
      <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[9999] bg-anime-bg/95 backdrop-blur-md border border-anime-border/45 p-5 rounded-2xl shadow-2xl flex flex-col space-y-3 animate-fade-in font-inter">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Install AniVerse</h4>
              <p className="text-[11px] text-anime-text/80">Add to home screen for full experience.</p>
            </div>
          </div>
          <button 
            onClick={handleIosDismiss}
            className="p-1 hover:bg-white/5 rounded-lg text-anime-text/40 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-xs text-anime-text/90 font-medium">
            Tap the <Share className="w-4 h-4 inline mx-1 mb-0.5" /> Share icon below
          </p>
          <p className="text-xs text-anime-text/90 font-medium">
            Then select <strong className="text-white">"Add to Home Screen"</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[9999] bg-anime-bg/95 backdrop-blur-md border border-anime-border/45 p-5 rounded-2xl shadow-2xl flex flex-col space-y-3 animate-fade-in font-inter">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Install AniVerse</h4>
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
