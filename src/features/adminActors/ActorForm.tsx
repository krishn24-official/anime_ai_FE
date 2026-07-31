import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { actorAdminService } from '../../services/actorAdminService';
import { actorService } from '../../services/actorService';

interface ActorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const ActorForm: React.FC<ActorFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingActors, setExistingActors] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [name, setName] = useState(initialData?.name || '');
  const [birthdate, setBirthdate] = useState(initialData?.birthdate || '');
  const [biography, setBiography] = useState(initialData?.biography || '');
  const [imageFile, setImageFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (name.trim().length >= 2) {
      const timer = setTimeout(() => {
        actorService.searchActors(name.trim()).then(res => {
          if (Array.isArray(res)) {
            setExistingActors(res);
          }
        }).catch(console.error);
      }, 300);
      return () => clearTimeout(timer);
    } else if (name.trim().length === 0 && existingActors.length === 0) {
      // Load initial batch if empty
      actorService.listActors(1, 1000).then(res => {
        setExistingActors(res.items || []);
      }).catch(console.error);
    }
  }, [name, existingActors.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (birthdate) formData.append('birthdate', birthdate);
      if (biography) formData.append('biography', biography);
      if (imageFile) formData.append('image', imageFile);

      if (initialData?._id) {
        await actorAdminService.updateActor(initialData._id, formData);
      } else {
        await actorAdminService.createActor(formData);
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0B0B0C]">
          <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Actor' : 'Create New Actor'}</h2>
          <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors p-2">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Name (Required)</label>
              <div className="relative">
                <input type="text" required value={name} onChange={e => {
                  setName(e.target.value);
                  setShowSuggestions(true);
                }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
                {showSuggestions && existingActors.length > 0 && name.trim().length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1B1E] border border-white/10 rounded-lg shadow-xl overflow-hidden z-[60] max-h-48 overflow-y-auto custom-scrollbar">
                    {existingActors.map(actor => (
                      <div key={actor._id} className="px-4 py-2.5 hover:bg-white/10 cursor-pointer text-white text-sm border-b border-white/5 last:border-0" onClick={() => {
                        setName(actor.name);
                        setShowSuggestions(false);
                      }}>
                        {actor.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Birthdate (e.g. July 30, 1970)</label>
              <input type="text" value={birthdate} onChange={e => setBirthdate(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Biography</label>
              <textarea rows={6} value={biography} onChange={e => setBiography(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Profile Image</label>
              {initialData?.images?.profile && !imageFile && (
                <div className="mb-2">
                  <img src={initialData.images.profile} alt="Current profile" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30" />
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-white/10 bg-[#0B0B0C] flex justify-end gap-4">
          <button type="button" onClick={onCancel} disabled={loading}
            className="px-6 py-2.5 text-white/70 font-medium hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Actor'}
          </button>
        </div>
      </div>
    </div>
  );
};
