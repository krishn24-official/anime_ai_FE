// @ts-nocheck
import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { tvSeriesAdminService } from '../../services/tvSeriesAdminService';

interface TvSeriesFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const TvSeriesForm: React.FC<TvSeriesFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [originalTitle, setOriginalTitle] = useState(initialData?.original_title || '');
  const [totalSeasons, setTotalSeasons] = useState<string>(initialData?.total_seasons?.toString() || '');
  const [totalEpisodes, setTotalEpisodes] = useState<string>(initialData?.total_episodes?.toString() || '');
  const [episodeRuntimeMinutes, setEpisodeRuntimeMinutes] = useState<string>(initialData?.episode_runtime_minutes?.toString() || '');
  
  const [genres, setGenres] = useState<string[]>(initialData?.genres || []);
  const [newGenre, setNewGenre] = useState('');
  
  const [creators, setCreators] = useState<string[]>(initialData?.creators || []);
  const [newCreator, setNewCreator] = useState('');
  
  const [language, setLanguage] = useState<string[]>(initialData?.language || []);
  const [newLanguage, setNewLanguage] = useState('');
  
  const [country, setCountry] = useState<string[]>(initialData?.country || []);
  const [newCountry, setNewCountry] = useState('');
  
  const [plot, setPlot] = useState(initialData?.plot || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [trailerUrl, setTrailerUrl] = useState(initialData?.trailer_url || '');

  const [released, setReleased] = useState<boolean>(
    initialData ? !['Planned', 'In Production', 'Pilot'].includes(initialData.status) : true
  );
  
  const [statusValue, setStatusValue] = useState<string>(
    initialData?.status || 'Returning Series'
  );

  const initialPrecision = initialData?.first_air_precision?.precision || (initialData?.first_air_date ? 'day' : 'year');
  const [startPrecision, setStartPrecision] = useState<string>(initialPrecision);
  
  const initialStartDateObj = initialData?.first_air_precision || (initialData?.first_air_date ? {
    year: initialData.first_air_date.split('-')[0],
    month: initialData.first_air_date.split('-')[1],
    day: initialData.first_air_date.split('-')[2]
  } : { year: initialData?.year });
  
  const [startDay, setStartDay] = useState<string>(initialStartDateObj?.day?.toString() || '');
  const [startMonth, setStartMonth] = useState<string>(initialStartDateObj?.month?.toString() || '');
  const [startYear, setStartYear] = useState<string>(initialStartDateObj?.year?.toString() || '');

  const initialHasEndDate = !!(initialData?.last_air_date || initialData?.last_air_precision);
  const [hasEndDate, setHasEndDate] = useState<boolean>(initialHasEndDate);
  const initialEndPrecision = initialData?.last_air_precision?.precision || (initialData?.last_air_date ? 'day' : 'day');
  const [endPrecision, setEndPrecision] = useState<string>(initialEndPrecision);
  
  const initialEndDateObj = initialData?.last_air_precision || (initialData?.last_air_date ? {
    year: initialData.last_air_date.split('-')[0],
    month: initialData.last_air_date.split('-')[1],
    day: initialData.last_air_date.split('-')[2]
  } : {});
  
  const [endDay, setEndDay] = useState<string>(initialEndDateObj?.day?.toString() || '');
  const [endMonth, setEndMonth] = useState<string>(initialEndDateObj?.month?.toString() || '');
  const [endYear, setEndYear] = useState<string>(initialEndDateObj?.year?.toString() || '');

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  
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

  const handleReleasedChange = (isReleased: boolean) => {
    setReleased(isReleased);
    setStatusValue(isReleased ? 'Returning Series' : 'Planned');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('original_title', originalTitle);
      formData.append('released', released.toString());
      formData.append('status_value', statusValue);
      if (totalSeasons) formData.append('total_seasons', totalSeasons);
      if (totalEpisodes) formData.append('total_episodes', totalEpisodes);
      if (episodeRuntimeMinutes) formData.append('episode_runtime_minutes', episodeRuntimeMinutes);
      
      formData.append('genres', JSON.stringify(genres));
      formData.append('creators', JSON.stringify(creators));
      formData.append('language', JSON.stringify(language));
      formData.append('country', JSON.stringify(country));
      if (plot) formData.append('plot', plot);
      if (tagline) formData.append('tagline', tagline);
      if (trailerUrl) formData.append('trailer_url', trailerUrl);
      
      formData.append('start_precision', startPrecision);
      if (startYear) formData.append('start_year', startYear);
      if (startPrecision === 'day' || startPrecision === 'month') {
        if (startMonth) formData.append('start_month', startMonth);
      }
      if (startPrecision === 'day') {
        if (startDay) formData.append('start_day', startDay);
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
      if (backdropFile) formData.append('backdrop', backdropFile);
      
      if (initialData?._id) {
        await tvSeriesAdminService.updateTvSeries(initialData._id, formData);
      } else {
        await tvSeriesAdminService.createTvSeries(formData);
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
            {initialData ? 'Edit TV Series' : 'Create TV Series'}
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
              <label className="block text-sm font-medium text-white/70 mb-1.5">Title</label>
              <input type="text" className={inputClass} value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Original Title</label>
              <input type="text" className={inputClass} value={originalTitle} onChange={e => setOriginalTitle(e.target.value)} />
            </div>
          </div>

          <div className="border border-white/10 rounded-xl p-4 bg-white/[0.01]">
            <h3 className="text-white font-medium mb-4">Start Date & Status</h3>
            
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="released" checked={released === true} onChange={() => handleReleasedChange(true)} />
                <span className="text-white/80">Released</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="released" checked={released === false} onChange={() => handleReleasedChange(false)} />
                <span className="text-white/80">Not Released</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-1.5">Status</label>
              <select className={inputClass} value={statusValue} onChange={e => setStatusValue(e.target.value)}>
                {released ? (
                  <>
                    <option value="Returning Series">Returning Series</option>
                    <option value="Ended">Ended</option>
                    <option value="Canceled">Canceled</option>
                  </>
                ) : (
                  <>
                    <option value="Planned">Planned</option>
                    <option value="In Production">In Production</option>
                    <option value="Pilot">Pilot</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Date Precision</label>
                <select className={inputClass} value={startPrecision} onChange={e => setStartPrecision(e.target.value)}>
                  <option value="day">Exact Day</option>
                  <option value="month">Month + Year</option>
                  <option value="year">Year Only</option>
                </select>
              </div>
              
              <div className="md:col-span-3 grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Year</label>
                  <input type="number" className={inputClass} value={startYear} onChange={e => setStartYear(e.target.value)} required />
                </div>
                {(startPrecision === 'month' || startPrecision === 'day') && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Month (1-12)</label>
                    <input type="number" className={inputClass} value={startMonth} onChange={e => setStartMonth(e.target.value)} min="1" max="12" required />
                  </div>
                )}
                {startPrecision === 'day' && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Day</label>
                    <input type="number" className={inputClass} value={startDay} onChange={e => setStartDay(e.target.value)} min="1" max="31" required />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Total Seasons</label>
              <input type="number" className={inputClass} value={totalSeasons} onChange={e => setTotalSeasons(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Total Episodes</label>
              <input type="number" className={inputClass} value={totalEpisodes} onChange={e => setTotalEpisodes(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Episode Runtime</label>
              <input type="number" className={inputClass} value={episodeRuntimeMinutes} onChange={e => setEpisodeRuntimeMinutes(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Genres</label>
              <input 
                type="text" 
                className={inputClass} 
                value={newGenre} 
                onChange={e => setNewGenre(e.target.value)} 
                onKeyDown={e => handleAddTag(e, genres, setGenres, newGenre, setNewGenre)} 
                placeholder="Press Enter to add" 
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {genres.map((g, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/70 flex items-center gap-1">
                    {g} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(i, genres, setGenres)} />
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Creators</label>
              <input 
                type="text" 
                className={inputClass} 
                value={newCreator} 
                onChange={e => setNewCreator(e.target.value)} 
                onKeyDown={e => handleAddTag(e, creators, setCreators, newCreator, setNewCreator)} 
                placeholder="Press Enter to add" 
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {creators.map((c, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/70 flex items-center gap-1">
                    {c} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(i, creators, setCreators)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Languages</label>
              <input 
                type="text" 
                className={inputClass} 
                value={newLanguage} 
                onChange={e => setNewLanguage(e.target.value)} 
                onKeyDown={e => handleAddTag(e, language, setLanguage, newLanguage, setNewLanguage)} 
                placeholder="Press Enter to add" 
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {language.map((l, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/70 flex items-center gap-1">
                    {l} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(i, language, setLanguage)} />
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Countries</label>
              <input 
                type="text" 
                className={inputClass} 
                value={newCountry} 
                onChange={e => setNewCountry(e.target.value)} 
                onKeyDown={e => handleAddTag(e, country, setCountry, newCountry, setNewCountry)} 
                placeholder="Press Enter to add" 
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {country.map((c, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/70 flex items-center gap-1">
                    {c} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(i, country, setCountry)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Plot</label>
            <textarea className={`${inputClass} min-h-[100px] resize-y`} value={plot} onChange={e => setPlot(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Tagline</label>
              <input type="text" className={inputClass} value={tagline} onChange={e => setTagline(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Trailer URL</label>
              <input type="url" className={inputClass} value={trailerUrl} onChange={e => setTrailerUrl(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Poster Image</label>
              <input type="file" accept="image/*" onChange={e => setPosterFile(e.target.files?.[0] || null)} className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-anime-primary file:text-white hover:file:bg-anime-primary/80" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Backdrop Image</label>
              <input type="file" accept="image/*" onChange={e => setBackdropFile(e.target.files?.[0] || null)} className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-anime-secondary file:text-white hover:file:bg-anime-secondary/80" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg font-bold text-white bg-white/10 hover:bg-white/20 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg font-bold text-white bg-anime-primary hover:bg-anime-primary/80 transition-colors flex items-center">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {initialData ? 'Update TV Series' : 'Create TV Series'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
