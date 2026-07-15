// @ts-nocheck
import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { animeAdminService } from '../../services/animeAdminService';

interface AnimeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const AnimeForm: React.FC<AnimeFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titleEnglish, setTitleEnglish] = useState(initialData?.title?.english || '');
  const [titleRomaji, setTitleRomaji] = useState(initialData?.title?.romaji || '');
  const [titleJapanese, setTitleJapanese] = useState(initialData?.title?.japanese || '');
  
  const [synonyms, setSynonyms] = useState<string[]>(initialData?.synonyms || []);
  const [newSynonym, setNewSynonym] = useState('');
  
  const [genres, setGenres] = useState<string[]>(initialData?.genres || []);
  const [newGenre, setNewGenre] = useState('');
  
  const [studios, setStudios] = useState<string[]>(initialData?.studios || []);
  const [newStudio, setNewStudio] = useState('');
  
  const [animeType, setAnimeType] = useState(initialData?.type || 'TV');
  const [source, setSource] = useState(initialData?.source || 'Original');
  const [episodes, setEpisodes] = useState<string>(initialData?.total_episodes?.toString() || '');
  const [duration, setDuration] = useState<string>(initialData?.duration_minutes?.toString() || '');

  const [released, setReleased] = useState<boolean>(
    initialData ? (initialData.status !== 'upcoming') : true
  );
  const [subStatus, setSubStatus] = useState<string>(
    initialData?.status === 'completed' ? 'completed' : 'ongoing'
  );
  
  const initialPrecision = initialData?.release_date?.precision || (initialData?.year && !initialData?.season ? 'year' : 'day');
  const [precision, setPrecision] = useState<string>(initialPrecision);
  
  const [day, setDay] = useState<string>(initialData?.release_date?.day?.toString() || '');
  const [month, setMonth] = useState<string>(initialData?.release_date?.month?.toString() || '');
  const [year, setYear] = useState<string>(initialData?.release_date?.year?.toString() || initialData?.year?.toString() || '');

  const initialHasEndDate = !!initialData?.end_date;
  const [hasEndDate, setHasEndDate] = useState<boolean>(initialHasEndDate);
  const initialEndPrecision = initialData?.end_date?.precision || 'day';
  const [endPrecision, setEndPrecision] = useState<string>(initialEndPrecision);
  const [endDay, setEndDay] = useState<string>(initialData?.end_date?.day?.toString() || '');
  const [endMonth, setEndMonth] = useState<string>(initialData?.end_date?.month?.toString() || '');
  const [endYear, setEndYear] = useState<string>(initialData?.end_date?.year?.toString() || '');

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>, state: string[], setState: any, val: string, setVal: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (val.trim() && !state.includes(val.trim())) {
        setState([...state, val.trim()]);
        setVal('');
      }
    }
  };
  
  const removeTag = (index: number, state: string[], setState: any) => {
    const newTags = [...state];
    newTags.splice(index, 1);
    setState(newTags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('title_english', titleEnglish);
      formData.append('title_romaji', titleRomaji);
      formData.append('title_japanese', titleJapanese);
      formData.append('synonyms', JSON.stringify(synonyms));
      formData.append('anime_type', animeType);
      formData.append('released', released.toString());
      formData.append('sub_status', subStatus);
      formData.append('genres', JSON.stringify(genres));
      formData.append('studios', JSON.stringify(studios));
      formData.append('source', source);
      if (episodes) formData.append('episodes', episodes);
      if (duration) formData.append('duration', duration);
      
      formData.append('precision', precision);
      if (year) formData.append('year', year);
      
      if (precision === 'day' || precision === 'month') {
        if (month) formData.append('month', month);
      }
      if (precision === 'day') {
        if (day) formData.append('day', day);
      }
      
      if (hasEndDate) {
        formData.append('end_precision', endPrecision);
        if (endYear) formData.append('end_year', endYear);
        if ((endPrecision === 'day' || endPrecision === 'month') && endMonth) {
          formData.append('end_month', endMonth);
        }
        if (endPrecision === 'day' && endDay) {
          formData.append('end_day', endDay);
        }
      } else if (initialHasEndDate) {
        formData.append('clear_end_date', 'true');
      }
      
      if (posterFile) formData.append('poster', posterFile);
      if (bannerFile) formData.append('banner', bannerFile);
      
      if (initialData?._id) {
        await animeAdminService.updateAnime(initialData._id, formData);
      } else {
        await animeAdminService.createAnime(formData);
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-anime-secondary border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-anime-primary transition-colors";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-anime-card rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Anime' : 'Create Anime'}
          </h2>
          <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">English Title</label>
              <input type="text" className={inputClass} value={titleEnglish} onChange={e => setTitleEnglish(e.target.value)} placeholder="e.g. Naruto" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Romaji Title</label>
              <input type="text" className={inputClass} value={titleRomaji} onChange={e => setTitleRomaji(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Type</label>
              <select className={inputClass} value={animeType} onChange={e => setAnimeType(e.target.value)}>
                <option value="TV">TV</option>
                <option value="Movie">Movie</option>
                <option value="OVA">OVA</option>
                <option value="ONA">ONA</option>
                <option value="Special">Special</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Source</label>
              <input type="text" className={inputClass} value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Manga, Original" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Total Episodes</label>
              <input type="number" className={inputClass} value={episodes} onChange={e => setEpisodes(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Duration (mins)</label>
              <input type="number" className={inputClass} value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>

          <div className="border border-white/10 rounded-xl p-4 bg-white/[0.01]">
            <h3 className="text-white font-medium mb-4">Release Information</h3>
            
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="released" checked={released === true} onChange={() => setReleased(true)} />
                <span className="text-white/80">Released</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="released" checked={released === false} onChange={() => setReleased(false)} />
                <span className="text-white/80">Not Released</span>
              </label>
            </div>

            {released && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/70 mb-1.5">Status</label>
                <select className={inputClass} value={subStatus} onChange={e => setSubStatus(e.target.value)}>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Date Precision</label>
                <select className={inputClass} value={precision} onChange={e => setPrecision(e.target.value)}>
                  <option value="day">Exact Day</option>
                  <option value="month">Month + Year</option>
                  <option value="year">Year Only</option>
                </select>
              </div>
              
              <div className="md:col-span-3 grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Year</label>
                  <input type="number" className={inputClass} value={year} onChange={e => setYear(e.target.value)} required />
                </div>
                {(precision === 'month' || precision === 'day') && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Month (1-12)</label>
                    <input type="number" className={inputClass} value={month} onChange={e => setMonth(e.target.value)} min="1" max="12" required />
                  </div>
                )}
                {precision === 'day' && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Day</label>
                    <input type="number" className={inputClass} value={day} onChange={e => setDay(e.target.value)} min="1" max="31" required />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border border-white/10 rounded-xl p-4 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">End Date Information</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasEndDate} 
                  onChange={(e) => setHasEndDate(e.target.checked)} 
                  className="rounded border-white/10 bg-white/5"
                />
                <span className="text-sm text-white/70">Add end date (Optional)</span>
              </label>
            </div>

            {hasEndDate && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Date Precision</label>
                  <select className={inputClass} value={endPrecision} onChange={e => setEndPrecision(e.target.value)}>
                    <option value="day">Exact Day</option>
                    <option value="month">Month + Year</option>
                    <option value="year">Year Only</option>
                  </select>
                </div>
                
                <div className="md:col-span-3 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Year</label>
                    <input type="number" className={inputClass} value={endYear} onChange={e => setEndYear(e.target.value)} required={hasEndDate} />
                  </div>
                  {(endPrecision === 'month' || endPrecision === 'day') && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Month (1-12)</label>
                      <input type="number" className={inputClass} value={endMonth} onChange={e => setEndMonth(e.target.value)} min="1" max="12" required={hasEndDate} />
                    </div>
                  )}
                  {endPrecision === 'day' && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Day</label>
                      <input type="number" className={inputClass} value={endDay} onChange={e => setEndDay(e.target.value)} min="1" max="31" required={hasEndDate} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Poster Image</label>
              <input type="file" accept="image/*" onChange={e => setPosterFile(e.target.files?.[0] || null)} className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-anime-primary file:text-white hover:file:bg-anime-primary/80" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Banner Image</label>
              <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-anime-secondary file:text-white hover:file:bg-anime-secondary/80" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg font-bold text-white bg-white/10 hover:bg-white/20 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg font-bold text-white bg-anime-primary hover:bg-anime-primary/80 transition-colors flex items-center">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? 'Update Anime' : 'Create Anime'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
