import React, { useState, useEffect, useRef } from 'react';
import { episodeChapterAdminService } from '../../services/episodeChapterAdminService';
import type { CreateEpisodePayload, UpdateEpisodePayload, CreateChapterPayload, UpdateChapterPayload } from '../../services/episodeChapterAdminService';
import { searchService } from '../../services/searchService';

export const AdminEpisodesChapters: React.FC = () => {
  const [parentType, setParentType] = useState<'anime' | 'tv_series' | 'manga'>('anime');
  const [parentId, setParentId] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Autocomplete State
  const [parentSearchQuery, setParentSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [itemNumber, setItemNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [director, setDirector] = useState('');
  const [arc, setArc] = useState('');
  const [isFiller, setIsFiller] = useState(false);
  const [canonType, setCanonType] = useState('');
  const [summary, setSummary] = useState('');

  const fetchItems = async () => {
    if (!parentId) return;
    setLoading(true);
    setError('');
    try {
      if (parentType === 'manga') {
        const data = await episodeChapterAdminService.listChapters(parentId);
        setItems(data.sort((a: any, b: any) => a.chapter_number - b.chapter_number));
      } else {
        const data = await episodeChapterAdminService.listEpisodes(parentType, parentId);
        setItems(data.sort((a: any, b: any) => a.episode_number - b.episode_number));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    resetForm();
  }, [parentType, parentId]);

  useEffect(() => {
    if (!parentSearchQuery.trim() || parentSearchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    // Don't search if we just selected an item (query matches ID, or is fully resolved)
    // We'll rely on the user typing.
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchService.globalSearch(parentSearchQuery);
        if (parentType === 'anime') setSearchResults(results.anime || []);
        else if (parentType === 'tv_series') setSearchResults(results.tv_series || []);
        else if (parentType === 'manga') setSearchResults(results.manga || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [parentSearchQuery, parentType]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId('');
    setItemNumber(items.length > 0 ? (parentType === 'manga' ? items[items.length-1].chapter_number + 1 : items[items.length-1].episode_number + 1) : 1);
    setTitle('');
    setReleaseDate('');
    setDirector('');
    setArc('');
    setIsFiller(false);
    setCanonType('');
    setSummary('');
  };

  const handleEdit = (item: any) => {
    setIsEditing(true);
    setCurrentId(item._id);
    if (parentType === 'manga') {
      setItemNumber(item.chapter_number);
      setReleaseDate(item.release_date || '');
      setSummary(item.summary || '');
    } else {
      setItemNumber(item.episode_number);
      setTitle(item.title || '');
      setReleaseDate(item.release_date || '');
      setDirector(item.director || '');
      setArc(item.arc || '');
      setIsFiller(item.is_filler || false);
      setCanonType(item.canon_type || '');
      setSummary(item.summary || '');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      if (parentType === 'manga') {
        await episodeChapterAdminService.deleteChapter(id);
      } else {
        await episodeChapterAdminService.deleteEpisode(id);
      }
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Delete failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId) {
      setError('Please enter a Parent ID first');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      if (parentType === 'manga') {
        if (isEditing) {
          const payload: UpdateChapterPayload = {
            release_date: releaseDate || undefined,
            summary: summary || undefined
          };
          await episodeChapterAdminService.updateChapter(currentId, payload);
          setSuccessMsg('Chapter updated successfully');
        } else {
          const payload: CreateChapterPayload = {
            manga_id: parentId,
            chapter_number: itemNumber,
            release_date: releaseDate || undefined,
            summary: summary || undefined
          };
          await episodeChapterAdminService.createChapter(payload);
          setSuccessMsg('Chapter created successfully');
        }
      } else {
        if (isEditing) {
          const payload: UpdateEpisodePayload = {
            title: title || undefined,
            release_date: releaseDate || undefined,
            director: director || undefined,
            arc: arc || undefined,
            is_filler: isFiller,
            canon_type: canonType || undefined,
            summary: summary || undefined
          };
          await episodeChapterAdminService.updateEpisode(currentId, payload);
          setSuccessMsg('Episode updated successfully');
        } else {
          const payload: CreateEpisodePayload = {
            parent_type: parentType,
            parent_content_id: parentId,
            episode_number: itemNumber,
            title: title || undefined,
            release_date: releaseDate || undefined,
            director: director || undefined,
            arc: arc || undefined,
            is_filler: isFiller,
            canon_type: canonType || undefined,
            summary: summary || undefined
          };
          await episodeChapterAdminService.createEpisode(payload);
          setSuccessMsg('Episode created successfully');
        }
      }
      resetForm();
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Episodes & Chapters</h1>
      
      <div className="mb-8 bg-gray-900 p-4 rounded-lg">
        <h2 className="text-xl mb-4 font-semibold">Select Parent Context</h2>
        <div className="flex gap-4 items-center">
          <select 
            value={parentType}
            onChange={(e: any) => { 
              setParentType(e.target.value); 
              setParentId(''); 
              setParentSearchQuery('');
              setSearchResults([]);
            }}
            className="p-2 bg-gray-800 text-white rounded border border-gray-700"
          >
            <option value="anime">Anime</option>
            <option value="tv_series">TV Series</option>
            <option value="manga">Manga</option>
          </select>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Search ${parentType.toUpperCase()}...`}
              value={parentSearchQuery}
              onChange={(e) => {
                setParentSearchQuery(e.target.value);
                if (parentId) setParentId(''); // clear selected ID if they type again
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((item) => {
                  const title = parentType === 'anime' 
                    ? (item.title.english || item.title.romaji || item.title.japanese || item.title)
                    : (item.title || item.name);
                  return (
                    <div 
                      key={item._id}
                      onClick={() => {
                        setParentId(item._id);
                        setParentSearchQuery(title);
                        setShowDropdown(false);
                      }}
                      className="p-3 cursor-pointer hover:bg-gray-700 flex items-center gap-3"
                    >
                      {item.images?.poster || item.cover_image ? (
                        <img src={item.images?.poster || item.cover_image} alt="poster" className="w-8 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-8 h-12 bg-gray-600 rounded"></div>
                      )}
                      <div>
                        <div className="font-semibold">{title}</div>
                        <div className="text-xs text-gray-400">ID: {item._id}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Click outside listener could go here, but simple blur is tricky with clicks. Let's rely on selection. */}
          </div>
        </div>
      </div>

      {parentId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? `Edit ${parentType === 'manga' ? 'Chapter' : 'Episode'}` : `Create New ${parentType === 'manga' ? 'Chapter' : 'Episode'}`}
            </h2>
            
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {successMsg && <div className="text-green-500 mb-4">{successMsg}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">{parentType === 'manga' ? 'Chapter Number' : 'Episode Number'}</label>
                <input
                  type="number"
                  value={itemNumber}
                  onChange={(e) => setItemNumber(parseInt(e.target.value))}
                  disabled={isEditing}
                  required
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700 disabled:opacity-50"
                />
              </div>

              {parentType !== 'manga' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">Director</label>
                      <input
                        type="text"
                        value={director}
                        onChange={(e) => setDirector(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">Arc</label>
                      <input
                        type="text"
                        value={arc}
                        onChange={(e) => setArc(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFiller}
                        onChange={(e) => setIsFiller(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-700"
                      />
                      Is Filler
                    </label>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">Canon Type</label>
                      <input
                        type="text"
                        value={canonType}
                        onChange={(e) => setCanonType(e.target.value)}
                        className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                        placeholder="e.g. Manga Canon, Anime Canon"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Release Date (YYYY-MM-DD)</label>
                <input
                  type="text"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  placeholder="2026-10-15"
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700 h-24"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-white transition-colors">
                  {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-white transition-colors">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg max-h-[800px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Existing {parentType === 'manga' ? 'Chapters' : 'Episodes'}</h2>
            {loading && items.length === 0 ? (
              <div>Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-gray-500">No items found for this parent ID.</div>
            ) : (
              <ul className="space-y-4">
                {items.map((item: any) => {
                  const num = parentType === 'manga' ? item.chapter_number : item.episode_number;
                  return (
                    <li key={item._id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">{num}. {item.title || 'Untitled'}</div>
                        {item.release_date && <div className="text-sm text-gray-400">Release: {item.release_date}</div>}
                        {item.is_filler && <span className="inline-block mt-1 text-xs bg-orange-600 px-2 py-1 rounded">Filler</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-semibold">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold">
                          Delete
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
