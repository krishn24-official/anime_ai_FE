// @ts-nocheck
import React, { useState } from 'react';
import { Upload, X, Plus, Loader2 } from 'lucide-react';
import { movieAdminService } from '../../services/movieAdminService';
import { actorService, type ActorItem } from '../../services/actorService';

interface MovieFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export const MovieForm: React.FC<MovieFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [originalTitle, setOriginalTitle] = useState(initialData?.original_title || '');
  
  const [genres, setGenres] = useState<string[]>(initialData?.genres || []);
  const [newGenre, setNewGenre] = useState('');
  
  const [director, setDirector] = useState<string[]>(initialData?.director || []);
  const [newDirector, setNewDirector] = useState('');
  
  const [writers, setWriters] = useState<string[]>(initialData?.writers || []);
  const [newWriter, setNewWriter] = useState('');
  
  const [language, setLanguage] = useState<string[]>(initialData?.language || []);
  const [newLanguage, setNewLanguage] = useState('');
  
  const [country, setCountry] = useState<string[]>(initialData?.country || []);
  const [newCountry, setNewCountry] = useState('');
  
  const [producers, setProducers] = useState<string[]>(initialData?.producers || []);
  const [newProducer, setNewProducer] = useState('');
  
  const [productionHouse, setProductionHouse] = useState<string[]>(initialData?.production_house || []);
  const [newProductionHouse, setNewProductionHouse] = useState('');
  
  const [plot, setPlot] = useState(initialData?.plot || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [trailers, setTrailers] = useState<{url: string, label: string}[]>(initialData?.trailers || []);
  
  const [actors, setActors] = useState<string[]>(initialData?.actors || []);
  const [newActor, setNewActor] = useState('');
  const [availableActors, setAvailableActors] = useState<ActorItem[]>([]);
  
  React.useEffect(() => {
    actorService.listActors(1, 1000).then(res => setAvailableActors(res.items)).catch(console.error);
  }, []);
  
  const [runtimeMinutes, setRuntimeMinutes] = useState<string>(initialData?.runtime_minutes?.toString() || '');

  const [released, setReleased] = useState<boolean>(
    initialData ? (initialData.status === 'Released') : true
  );
  const [subStatus, setSubStatus] = useState<string>(
    initialData?.status && initialData.status !== 'Released' ? initialData.status : 'Planned'
  );
  
  const initialPrecision = initialData?.release_precision?.precision || (initialData?.release_date ? 'day' : 'year');
  const [precision, setPrecision] = useState<'day' | 'month' | 'year'>(initialPrecision);
  
  let initialDay = '';
  let initialMonth = '';
  let initialYear = '';
  
  if (initialData?.release_date) {
    const parts = initialData.release_date.split('-');
    if (parts.length === 3) {
      initialYear = parts[0];
      initialMonth = parseInt(parts[1], 10).toString();
      initialDay = parseInt(parts[2], 10).toString();
    }
  } else if (initialData?.release_precision) {
    initialYear = initialData.release_precision.year?.toString() || '';
    initialMonth = initialData.release_precision.month?.toString() || '';
  }

  const [day, setDay] = useState<string>(initialDay);
  const [month, setMonth] = useState<string>(initialMonth);
  const [year, setYear] = useState<string>(initialYear);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>, state: string[], setState: any, val: string, setVal: any, requireActor = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(state, setState, val, setVal, requireActor);
    }
  };

  const addTag = (state: string[], setState: any, val: string, setVal: any, requireActor = false) => {
    if (val.trim() && !state.includes(val.trim())) {
      if (requireActor) {
        const exists = availableActors.find(a => a.name.toLowerCase() === val.trim().toLowerCase());
        if (!exists) {
          alert(`"${val.trim()}" not found in Actors collection. Please create it first in Manage Actors.`);
          return;
        }
      }
      setState([...state, val.trim()]);
      setVal('');
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
      const payload: any = {
        title,
        original_title: originalTitle,
        released,
        sub_status: subStatus,
        precision,
        genres,
        director,
        writers,
        language,
        country,
        producers,
        production_house: productionHouse,
        actors,
        plot,
        tagline,
        trailers,
        poster: posterFile,
        backdrop: backdropFile
      };
      
      if (runtimeMinutes) payload.runtime_minutes = parseInt(runtimeMinutes, 10);
      if (year) payload.year = parseInt(year, 10);
      if (month && (precision === 'day' || precision === 'month')) payload.month = parseInt(month, 10);
      if (day && precision === 'day') payload.day = parseInt(day, 10);
      
      if (initialData?._id) {
        await movieAdminService.updateMovie(initialData._id, payload);
      } else {
        await movieAdminService.createMovie(payload);
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0B0B0C] sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Movie' : 'Create New Movie'}</h2>
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
          
          <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            
            {/* Title Section */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Title Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Title (Required)</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Original Title</label>
                  <input type="text" value={originalTitle} onChange={e => setOriginalTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
                </div>
              </div>
            </div>

            {/* Status & Release Section */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Status & Release</h3>
              
              <div className="flex items-center gap-6 mb-6">
                <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                  <input type="radio" checked={released} onChange={() => setReleased(true)} className="accent-blue-600 w-4 h-4" />
                  Released
                </label>
                <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                  <input type="radio" checked={!released} onChange={() => setReleased(false)} className="accent-blue-600 w-4 h-4" />
                  Not Released
                </label>
              </div>
              
              {!released && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/70 mb-1">Sub-Status</label>
                  <select value={subStatus} onChange={e => setSubStatus(e.target.value)}
                    className="w-full md:w-1/2 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600">
                    <option value="Planned">Planned</option>
                    <option value="In Production">In Production</option>
                    <option value="Post Production">Post Production</option>
                    <option value="Rumored">Rumored</option>
                  </select>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/70 mb-1">Date Precision</label>
                <select value={precision} onChange={e => setPrecision(e.target.value as any)}
                  className="w-full md:w-1/2 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600">
                  <option value="day">Day (Exact Date)</option>
                  <option value="month">Month (e.g. Oct 2024)</option>
                  <option value="year">Year (e.g. 2025)</option>
                </select>
                {released && precision !== 'day' && (
                  <p className="text-amber-500 text-xs mt-1">Released movies require day-level precision.</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(precision === 'day' || precision === 'month' || precision === 'year') && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Year</label>
                    <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="YYYY"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
                  </div>
                )}
                {(precision === 'day' || precision === 'month') && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Month (1-12)</label>
                    <input type="number" min="1" max="12" value={month} onChange={e => setMonth(e.target.value)} placeholder="MM"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
                  </div>
                )}
                {precision === 'day' && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Day (1-31)</label>
                    <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} placeholder="DD"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Metadata Section */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-6">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Metadata</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Runtime (Minutes)</label>
                  <input type="number" value={runtimeMinutes} onChange={e => setRuntimeMinutes(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
                </div>
                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-medium text-white/70 mb-2">Trailers</label>
                  <div className="space-y-3">
                    {trailers.map((trailer, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-2">
                        <input type="text" placeholder="Label (e.g. Official Trailer)" value={trailer.label} onChange={e => { const newT = [...trailers]; newT[idx] = { ...newT[idx], label: e.target.value }; setTrailers(newT); }} className="w-full md:w-1/3 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
                        <div className="flex w-full md:flex-1 gap-2">
                          <input type="text" placeholder="YouTube URL" value={trailer.url} onChange={e => { const newT = [...trailers]; newT[idx] = { ...newT[idx], url: e.target.value }; setTrailers(newT); }} className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
                          <button type="button" onClick={() => { const newT = [...trailers]; newT.splice(idx, 1); setTrailers(newT); }} className="px-3 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600/40 transition-colors shrink-0">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setTrailers([...trailers, { url: '', label: '' }])} className="text-sm bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Trailer
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tag Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Genres</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {genres.map((tag, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(idx, genres, setGenres)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newGenre} onChange={e => setNewGenre(e.target.value)}
                      onKeyDown={e => handleAddTag(e, genres, setGenres, newGenre, setNewGenre)}
                      placeholder="Type and press Enter"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm" />
                    <button type="button" onClick={() => addTag(genres, setGenres, newGenre, setNewGenre)} className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium text-sm transition-colors shrink-0">Add</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Directors</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {director.map((tag, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(idx, director, setDirector)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newDirector} onChange={e => setNewDirector(e.target.value)}
                      onKeyDown={e => handleAddTag(e, director, setDirector, newDirector, setNewDirector, true)}
                      list="actors-list"
                      placeholder="Type director name and press Enter"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm" />
                    <button type="button" onClick={() => addTag(director, setDirector, newDirector, setNewDirector, true)} className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium text-sm transition-colors shrink-0">Add</button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Writers</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {writers.map((tag, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(idx, writers, setWriters)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newWriter} onChange={e => setNewWriter(e.target.value)}
                      onKeyDown={e => handleAddTag(e, writers, setWriters, newWriter, setNewWriter)}
                      placeholder="Type and press Enter"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm" />
                    <button type="button" onClick={() => addTag(writers, setWriters, newWriter, setNewWriter)} className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium text-sm transition-colors shrink-0">Add</button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Countries</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {country.map((tag, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(idx, country, setCountry)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newCountry} onChange={e => setNewCountry(e.target.value)}
                      onKeyDown={e => handleAddTag(e, country, setCountry, newCountry, setNewCountry)}
                      placeholder="Type and press Enter"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm" />
                    <button type="button" onClick={() => addTag(country, setCountry, newCountry, setNewCountry)} className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium text-sm transition-colors shrink-0">Add</button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Producers</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {producers.map((tag, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(idx, producers, setProducers)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newProducer} onChange={e => setNewProducer(e.target.value)}
                      onKeyDown={e => handleAddTag(e, producers, setProducers, newProducer, setNewProducer)}
                      placeholder="Type and press Enter"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm" />
                    <button type="button" onClick={() => addTag(producers, setProducers, newProducer, setNewProducer)} className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium text-sm transition-colors shrink-0">Add</button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Production House</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {productionHouse.map((tag, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(idx, productionHouse, setProductionHouse)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newProductionHouse} onChange={e => setNewProductionHouse(e.target.value)}
                      onKeyDown={e => handleAddTag(e, productionHouse, setProductionHouse, newProductionHouse, setNewProductionHouse)}
                      placeholder="Type and press Enter"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm" />
                    <button type="button" onClick={() => addTag(productionHouse, setProductionHouse, newProductionHouse, setNewProductionHouse)} className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium text-sm transition-colors shrink-0">Add</button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Actors</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {actors.map((tag, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(idx, actors, setActors)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newActor} onChange={e => setNewActor(e.target.value)}
                      onKeyDown={e => handleAddTag(e, actors, setActors, newActor, setNewActor, true)}
                      list="actors-list"
                      placeholder="Type actor name and press Enter"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm" />
                    <datalist id="actors-list">
                      {availableActors.map(actor => (
                        <option key={actor._id} value={actor.name} />
                      ))}
                    </datalist>
                    <button type="button" onClick={() => addTag(actors, setActors, newActor, setNewActor, true)} className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium text-sm transition-colors shrink-0">Add</button>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/70 mb-1">Languages</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {language.map((tag, idx) => (
                      <span key={idx} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeTag(idx, language, setLanguage)} />
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 md:w-1/2">
                    <input type="text" value={newLanguage} onChange={e => setNewLanguage(e.target.value)}
                      onKeyDown={e => handleAddTag(e, language, setLanguage, newLanguage, setNewLanguage)}
                      placeholder="Type and press Enter"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm" />
                    <button type="button" onClick={() => addTag(language, setLanguage, newLanguage, setNewLanguage)} className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium text-sm transition-colors shrink-0">Add</button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Tagline</label>
                <input type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Plot Summary</label>
                <textarea rows={4} value={plot} onChange={e => setPlot(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600 resize-none" />
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Images</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Poster</label>
                  {initialData?.images?.poster && !posterFile && (
                    <div className="mb-2">
                      <img src={initialData.images.poster} alt="Current poster" className="w-24 h-36 object-cover rounded-lg border border-white/10" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => setPosterFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Backdrop</label>
                  {initialData?.images?.backdrop && !backdropFile && (
                    <div className="mb-2">
                      <img src={initialData.images.backdrop} alt="Current backdrop" className="w-48 h-27 object-cover rounded-lg border border-white/10" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => setBackdropFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30" />
                </div>
              </div>
            </div>

          </form>
        </div>
        
        <div className="p-6 border-t border-white/10 bg-[#0B0B0C] flex justify-end gap-4 sticky bottom-0 z-10">
          <button type="button" onClick={onCancel} disabled={loading}
            className="px-6 py-2.5 text-white/70 font-medium hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Movie'}
          </button>
        </div>
      </div>
    </div>
  );
};
