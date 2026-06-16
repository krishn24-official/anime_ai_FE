import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { sendMessage, clearHistory } from '../../store/slices/chatSlice';
import { Bot, Send, Trash2, Sparkles, User, Camera, Image, X } from 'lucide-react';

const Chatbot: React.FC = () => {
  const dispatch = useDispatch();
  const { messages, status } = useSelector((state: RootState) => state.chat);
  
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const quickPrompts = [
    "Who is celebrating their birthday today?",
    "Recommend a must-watch anime series",
    "What games can I play on this hub?",
    "What is the latest anime news?"
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Sync stream to video element when it opens
  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current && !cameraError) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen, cameraError]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    dispatch(sendMessage({
      text: inputText || "Analyze this character image",
      image: selectedImage || undefined
    }) as any);

    setInputText('');
    setSelectedImage(null);
  };

  const handleQuickPrompt = (prompt: string) => {
    dispatch(sendMessage(prompt) as any);
  };

  // File Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value to allow uploading same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  // Open Camera Feed
  const openCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Could not access your camera. Make sure permissions are allowed.");
    }
  };

  // Close Camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  // Capture Photo
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
      }
      closeCamera();
    }
  };

  // Helper to format chatbot messages with simple Markdown
  const formatMessage = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let elements: React.ReactNode[] = [];
      let currentText = line;
      let key = 0;

      const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
      const parts = currentText.split(regex);

      parts.forEach((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          elements.push(<strong key={key++} className="font-extrabold text-white">{part.slice(2, -2)}</strong>);
        } else if (part.startsWith('*') && part.endsWith('*')) {
          elements.push(<em key={key++} className="italic text-anime-primary">{part.slice(1, -1)}</em>);
        } else if (part.startsWith('`') && part.endsWith('`')) {
          elements.push(<code key={key++} className="bg-black/40 px-1.5 py-0.5 rounded text-anime-purple font-mono text-[10px]">{part.slice(1, -1)}</code>);
        } else {
          elements.push(part);
        }
      });

      return <div key={idx} className="min-h-[1.2em]">{elements}</div>;
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col justify-between glass-panel rounded-2xl border border-anime-border overflow-hidden animate-fade-in relative">
      
      {/* Chat Header */}
      <div className="px-6 py-4 bg-white/5 border-b border-anime-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-anime-primary/10 border border-anime-primary/25 flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-anime-primary animate-pulse" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-anime-bg" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Anime AI Companion</h3>
            <span className="text-[10px] text-anime-secondary font-medium">Online & ready to talk</span>
          </div>
        </div>

        {/* Clear History */}
        <button
          onClick={() => dispatch(clearHistory())}
          className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl text-anime-text hover:text-red-400 transition-all flex items-center space-x-1.5 text-xs font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] sm:max-w-[70%] ${
                isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isBot
                  ? 'bg-anime-primary/10 border-anime-primary/25 text-anime-primary'
                  : 'bg-anime-purple/10 border-anime-purple/25 text-anime-purple'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                  isBot
                    ? 'bg-white/5 border-anime-border text-white rounded-tl-none'
                    : 'bg-anime-primary/10 border-anime-primary/25 text-white rounded-tr-none'
                }`}>
                  {msg.image && (
                    <div className="mb-2.5 max-w-xs overflow-hidden rounded-xl border border-white/10 shadow-md">
                      <img src={msg.image} alt="User sent character" className="w-full h-auto object-cover max-h-48" />
                    </div>
                  )}
                  <div className="space-y-1 font-medium">
                    {formatMessage(msg.text)}
                  </div>
                </div>
                <div className={`text-[9px] text-anime-text/40 px-1 ${!isBot && 'text-right'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {status === 'typing' && (
          <div className="flex items-start gap-3 mr-auto max-w-[70%]">
            <div className="w-8 h-8 rounded-lg bg-anime-primary/10 border border-anime-primary/25 text-anime-primary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-4 bg-white/5 border border-anime-border rounded-2xl rounded-tl-none text-xs text-white">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-anime-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-anime-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-anime-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input controls & Quick tags */}
      <div className="p-6 bg-white/5 border-t border-anime-border space-y-4">
        
        {/* Quick prompt suggestions */}
        {messages.length === 1 && !selectedImage && (
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:border-anime-primary/50 text-anime-text hover:text-white rounded-xl text-[10px] font-semibold transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3 h-3 text-anime-primary" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        )}

        {/* Form Input Container */}
        <form onSubmit={handleSend} className="space-y-3">
          
          {/* Image Preview Container */}
          {selectedImage && (
            <div className="relative inline-block border border-anime-primary/30 rounded-xl overflow-hidden bg-black/35 p-1 animate-fade-in">
              <img src={selectedImage} alt="Selected preview" className="h-20 w-auto rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-red-500 text-white rounded-full transition-all border border-white/10"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="relative flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Media Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={status === 'typing'}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-anime-text hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Upload Image"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={openCamera}
                disabled={status === 'typing'}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-anime-text hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Click Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Text Input & Submit */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={status === 'typing'}
                placeholder={selectedImage ? "Add an optional caption for character recognition..." : "Type your message to the companion..."}
                className="flex-1 bg-black/40 border border-white/10 focus:border-anime-primary rounded-xl py-3.5 pl-4 pr-12 text-xs text-white focus:outline-none placeholder:text-anime-text/40 transition-all"
              />
              <button
                type="submit"
                disabled={status === 'typing' || (!inputText.trim() && !selectedImage)}
                className="absolute right-2 p-2 bg-anime-primary text-anime-bg hover:bg-white hover:text-anime-primary transition-all rounded-lg disabled:opacity-40 disabled:hover:bg-anime-primary disabled:hover:text-anime-bg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-anime-primary/30 overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 bg-white/5 border-b border-anime-border flex justify-between items-center">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-anime-primary animate-pulse" />
                Capture Character Photo
              </h3>
              <button
                onClick={closeCamera}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-anime-text hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video preview / error display */}
            <div className="relative bg-black aspect-video flex items-center justify-center border-b border-anime-border">
              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <p className="text-red-400 text-xs">{cameraError}</p>
                  <p className="text-anime-text/60 text-[10px]">Please ensure camera permissions are granted and no other app is using it.</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Controls */}
            <div className="p-4 bg-white/5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCamera}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-anime-text hover:text-white text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-anime-primary text-anime-bg hover:bg-white hover:text-anime-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-anime-primary/25"
                >
                  <Camera className="w-4 h-4" />
                  Capture
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Chatbot;
