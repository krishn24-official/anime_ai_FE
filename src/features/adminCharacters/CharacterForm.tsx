import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { characterAdminService } from '../../services/characterAdminService';
import { apiClient } from '../../services/apiClient';

interface CharacterFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [nativeName, setNativeName] = useState(initialData?.native_name || '');
  
  const [birthDay, setBirthDay] = useState(initialData?.birth_day?.toString() || '');
  const [birthMonth, setBirthMonth] = useState(initialData?.birth_month?.toString() || '');
  
  const [height, setHeight] = useState(initialData?.physical?.height || '');
  const [hairColor, setHairColor] = useState(initialData?.physical?.hair_color || '');
  const [hasHair, setHasHair] = useState(initialData?.physical?.has_hair !== false);
  
  const [description, setDescription] = useState(initialData?.description || '');
  
  const [gender, setGender] = useState(initialData?.gender || '');
  const [role, setRole] = useState(initialData?.role || 'unknown');
  const [status, setStatus] = useState(initialData?.status || 'alive');
  const [species, setSpecies] = useState(initialData?.species || 'unknown');

  const [animeIds, setAnimeIds] = useState<string[]>(initialData?.anime_ids || []);
  const [mangaIds, setMangaIds] = useState<string[]>(initialData?.manga_ids || []);
  
  const [affiliations, setAffiliations] = useState<string[]>(initialData?.affiliations || []);
  const [newAffiliation, setNewAffiliation] = useState('');
  
  const [abilities, setAbilities] = useState<string[]>(initialData?.abilities || []);
  const [newAbility, setNewAbility] = useState('');
  
  const [forms, setForms] = useState<string[]>(initialData?.forms || []);
  const [newForm, setNewForm] = useState('');
  
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  // Search state for Anime
  const [animeQuery, setAnimeQuery] = useState('');
  const [animeResults, setAnimeResults] = useState<any[]>([]);
  const [animeSearching, setAnimeSearching] = useState(false);
  
  // Search state for Manga
  const [mangaQuery, setMangaQuery] = useState('');
  const [mangaResults, setMangaResults] = useState<any[]>([]);
  const [mangaSearching, setMangaSearching] = useState(false);

  useEffect(() => {
    if (animeQuery.length >= 2) {
      setAnimeSearching(true);
      const delay = setTimeout(() => {
        apiClient.get(`/admin/relationships/search-entities?q=${animeQuery}&types=anime,movie,tv_series&limit=10`)
          .then((res: any) => setAnimeResults(res || []))
          .catch(() => setAnimeResults([]))
          .finally(() => setAnimeSearching(false));
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setAnimeResults([]);
    }
  }, [animeQuery]);
  
  useEffect(() => {
    if (mangaQuery.length >= 2) {
      setMangaSearching(true);
      const delay = setTimeout(() => {
        apiClient.get(`/admin/relationships/search-entities?q=${mangaQuery}&types=manga&limit=10`)
          .then((res: any) => setMangaResults(res || []))
          .catch(() => setMangaResults([]))
          .finally(() => setMangaSearching(false));
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setMangaResults([]);
    }
  }, [mangaQuery]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>, state: string[], setState: any, val: string, setVal: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (val.trim() && !state.includes(val.trim())) {
        setState([...state, val.trim()]);
        setVal('');
      }
    }
  };

  const removeTag = (state: string[], setState: any, tag: string) => {
    setState(state.filter(t => t !== tag));
  };
  
  const addAnimeId = (id: string) => {
    if (!animeIds.includes(id)) {
      setAnimeIds([...animeIds, id]);
    }
    setAnimeQuery('');
    setAnimeResults([]);
  };

  const addMangaId = (id: string) => {
    if (!mangaIds.includes(id)) {
      setMangaIds([...mangaIds, id]);
    }
    setMangaQuery('');
    setMangaResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    if (nativeName) formData.append('native_name', nativeName);
    
    if (birthDay) formData.append('birth_day', birthDay);
    if (birthMonth) formData.append('birth_month', birthMonth);
    
    if (height) formData.append('height', height);
    if (hairColor) formData.append('hair_color', hairColor);
    formData.append('has_hair', hasHair ? 'true' : 'false');
    
    if (description) formData.append('description', description);
    if (gender) formData.append('gender', gender);
    if (role) formData.append('role', role);
    if (status) formData.append('status', status);
    if (species) formData.append('species', species);
    
    formData.append('anime_ids', JSON.stringify(animeIds));
    formData.append('manga_ids', JSON.stringify(mangaIds));
    
    formData.append('affiliations', JSON.stringify(affiliations));
    formData.append('abilities', JSON.stringify(abilities));
    formData.append('forms', JSON.stringify(forms));
    formData.append('tags', JSON.stringify(tags));

    if (profileFile) formData.append('profile_image', profileFile);
    if (bannerFile) formData.append('banner_image', bannerFile);

    try {
      if (initialData?._id) {
        await characterAdminService.updateCharacter(initialData._id, formData);
      } else {
        await characterAdminService.createCharacter(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#333]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">
          {initialData ? 'Edit Character' : 'Add New Character'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
            <input
              type="text"
              required
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Native Name</label>
            <input
              type="text"
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
              value={nativeName}
              onChange={(e) => setNativeName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Birth Date (Month / Day)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="MM (1-12)"
                min="1" max="12"
                className="w-1/2 bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
              />
              <input
                type="number"
                placeholder="DD (1-31)"
                min="1" max="31"
                className="w-1/2 bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
            <select
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-Binary</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
            <select
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="main">Main</option>
              <option value="supporting">Supporting</option>
              <option value="background">Background</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <input
              type="text"
              list="status-options"
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
            <datalist id="status-options">
              <option value="alive" />
              <option value="deceased" />
              <option value="unknown" />
            </datalist>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Species</label>
            <input
              type="text"
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Physical Traits</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Height (e.g. 175cm)"
                className="w-1/2 bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <input
                type="text"
                placeholder="Hair Color"
                className="w-1/2 bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
              />
            </div>
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="hasHair"
                checked={hasHair}
                onChange={(e) => setHasHair(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="hasHair" className="text-sm text-gray-400">Has Hair</label>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
          <textarea
            className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white h-24"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Anime Appears In (IDs)</label>
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search anime to add..."
                className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
                value={animeQuery}
                onChange={(e) => setAnimeQuery(e.target.value)}
              />
              {animeResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[#1e1e1e] border border-[#333] rounded max-h-48 overflow-y-auto">
                  {animeResults.map(a => (
                    <div 
                      key={a.id || a._id} 
                      className="p-2 hover:bg-[#333] cursor-pointer text-sm text-white"
                      onClick={() => addAnimeId(a.id || a._id)}
                    >
                      {a.name || a.title?.english || a.title?.romaji || a.title?.japanese || a.id || a._id}
                      <span className="ml-2 text-xs text-gray-500 uppercase">{a.entity_type || 'anime'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {animeIds.map(id => (
                <span key={id} className="px-2 py-1 bg-blue-900/50 text-blue-200 rounded text-sm flex items-center">
                  {id}
                  <button type="button" onClick={() => removeTag(animeIds, setAnimeIds, id)} className="ml-2 hover:text-white">&times;</button>
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Manga Appears In (IDs)</label>
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search manga to add..."
                className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white"
                value={mangaQuery}
                onChange={(e) => setMangaQuery(e.target.value)}
              />
              {mangaResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[#1e1e1e] border border-[#333] rounded max-h-48 overflow-y-auto">
                  {mangaResults.map(m => (
                    <div 
                      key={m.id || m._id} 
                      className="p-2 hover:bg-[#333] cursor-pointer text-sm text-white"
                      onClick={() => addMangaId(m.id || m._id)}
                    >
                      {m.name || m.id || m._id}
                      <span className="ml-2 text-xs text-gray-500 uppercase">{m.entity_type || 'manga'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {mangaIds.map(id => (
                <span key={id} className="px-2 py-1 bg-purple-900/50 text-purple-200 rounded text-sm flex items-center">
                  {id}
                  <button type="button" onClick={() => removeTag(mangaIds, setMangaIds, id)} className="ml-2 hover:text-white">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Affiliations</label>
            <input
              type="text"
              placeholder="Press Enter to add"
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white mb-2"
              value={newAffiliation}
              onChange={(e) => setNewAffiliation(e.target.value)}
              onKeyDown={(e) => handleAddTag(e, affiliations, setAffiliations, newAffiliation, setNewAffiliation)}
            />
            <div className="flex flex-wrap gap-2">
              {affiliations.map(a => (
                <span key={a} className="px-2 py-1 bg-[#333] rounded text-sm flex items-center text-white">
                  {a}
                  <button type="button" onClick={() => removeTag(affiliations, setAffiliations, a)} className="ml-2 hover:text-red-400">&times;</button>
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Abilities</label>
            <input
              type="text"
              placeholder="Press Enter to add"
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white mb-2"
              value={newAbility}
              onChange={(e) => setNewAbility(e.target.value)}
              onKeyDown={(e) => handleAddTag(e, abilities, setAbilities, newAbility, setNewAbility)}
            />
            <div className="flex flex-wrap gap-2">
              {abilities.map(a => (
                <span key={a} className="px-2 py-1 bg-[#333] rounded text-sm flex items-center text-white">
                  {a}
                  <button type="button" onClick={() => removeTag(abilities, setAbilities, a)} className="ml-2 hover:text-red-400">&times;</button>
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Forms</label>
            <input
              type="text"
              placeholder="Press Enter to add"
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white mb-2"
              value={newForm}
              onChange={(e) => setNewForm(e.target.value)}
              onKeyDown={(e) => handleAddTag(e, forms, setForms, newForm, setNewForm)}
            />
            <div className="flex flex-wrap gap-2">
              {forms.map(a => (
                <span key={a} className="px-2 py-1 bg-[#333] rounded text-sm flex items-center text-white">
                  {a}
                  <button type="button" onClick={() => removeTag(forms, setForms, a)} className="ml-2 hover:text-red-400">&times;</button>
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
            <input
              type="text"
              placeholder="Press Enter to add"
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white mb-2"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => handleAddTag(e, tags, setTags, newTag, setNewTag)}
            />
            <div className="flex flex-wrap gap-2">
              {tags.map(a => (
                <span key={a} className="px-2 py-1 bg-[#333] rounded text-sm flex items-center text-white">
                  {a}
                  <button type="button" onClick={() => removeTag(tags, setTags, a)} className="ml-2 hover:text-red-400">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Profile Image</label>
            <div className="border-2 border-dashed border-[#444] rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                className="hidden"
                id="profile-upload"
              />
              <label htmlFor="profile-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-sm text-gray-400">
                  {profileFile ? profileFile.name : 'Click to upload profile image'}
                </span>
              </label>
            </div>
            {initialData?.images?.profile && !profileFile && (
              <img src={initialData.images.profile} alt="Current profile" className="mt-2 w-16 h-16 object-cover rounded" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Banner Image</label>
            <div className="border-2 border-dashed border-[#444] rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                className="hidden"
                id="banner-upload"
              />
              <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-sm text-gray-400">
                  {bannerFile ? bannerFile.name : 'Click to upload banner image'}
                </span>
              </label>
            </div>
            {initialData?.images?.banner && !bannerFile && (
              <img src={initialData.images.banner} alt="Current banner" className="mt-2 h-16 w-32 object-cover rounded" />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {initialData ? 'Update Character' : 'Create Character'}
          </button>
        </div>
      </form>
    </div>
  );
};
