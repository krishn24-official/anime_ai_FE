import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import {
  createTierListThunk,
  updateTierListThunk,
  fetchTierListByIdThunk,
  searchContentThunk,
  clearSearchResults
} from '../../store/slices/tierListSlice';
import { Plus, Trash, Save, ArrowLeft, Search, Move, Lock, Globe, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import type { Tier, TierListItem } from '../../types';

const defaultTiers: Tier[] = [
  { name: 'S', color: '#FF6B6B', items: [] },
  { name: 'A', color: '#FFA500', items: [] },
  { name: 'B', color: '#FFD700', items: [] },
  { name: 'C', color: '#90EE90', items: [] },
  { name: 'D', color: '#4cc9f0', items: [] },
  { name: 'E', color: '#7209b7', items: [] },
  { name: 'F', color: '#f72585', items: [] },
  { name: 'Unassigned', color: 'transparent', items: [] }
];

const TierListEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentList, searchResults, loading, searchLoading, error } = useSelector((state: RootState) => state.tierList);

  const [name, setName] = useState('');
  const [tiers, setTiers] = useState<Tier[]>(defaultTiers);
  const [isPublic, setIsPublic] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  
  // Drag and drop visual state
  const [dragOverTierIdx, setDragOverTierIdx] = useState<number | null>(null);
  const [dragOverPool, setDragOverPool] = useState(false);

  const searchTimerRef = useRef<any>(null);

  // Load list details if editing
  useEffect(() => {
    if (id) {
      dispatch(fetchTierListByIdThunk(id));
    } else {
      setName('');
      setTiers(defaultTiers);
      setIsPublic(true);
    }
  }, [id, dispatch]);

  // Sync state with loaded list
  useEffect(() => {
    if (id && currentList) {
      setName(currentList.name);
      
      // Ensure there is always an Unassigned tier at the bottom
      const hasUnassigned = currentList.tiers.some(t => t.name === 'Unassigned');
      if (hasUnassigned) {
        setTiers(currentList.tiers);
      } else {
        setTiers([...currentList.tiers, { name: 'Unassigned', color: 'transparent', items: [] }]);
      }
      
      setIsPublic(currentList.is_public);
    }
  }, [currentList, id]);

  const isItemAdded = (contentId: string) => {
    return tiers.some(t => t.items.some(i => i.content_id === contentId));
  };

  const handleAddSearchItem = (item: any) => {
    const unassignedIdx = tiers.findIndex(t => t.name === 'Unassigned');
    if (unassignedIdx === -1) return;

    const exists = tiers.some(t => t.items.some(i => i.content_id === item.content_id));
    if (exists) return;

    const updated = [...tiers];
    const itemToAdd = {
      content_type: item.content_type,
      content_id: item.content_id,
      name: item.name,
      image: item.image
    };

    updated[unassignedIdx] = {
      ...updated[unassignedIdx],
      items: [...updated[unassignedIdx].items, itemToAdd]
    };
    setTiers(updated);
  };

  const handleRemoveSearchItem = (contentId: string) => {
    const updated = tiers.map(t => ({
      ...t,
      items: t.items.filter(i => i.content_id !== contentId)
    }));
    setTiers(updated);
  };

  const handleDropOnPool = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPool(false);
    const unassignedIdx = tiers.findIndex(t => t.name === 'Unassigned');
    if (unassignedIdx === -1) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data) return;

      const updatedTiers = [...tiers];

      if (data.source === 'search') {
        const exists = updatedTiers.some(t => t.items.some(i => i.content_id === data.item.content_id));
        if (exists) {
          alert('Item is already in the tier list!');
          return;
        }
        updatedTiers[unassignedIdx] = {
          ...updatedTiers[unassignedIdx],
          items: [...updatedTiers[unassignedIdx].items, data.item]
        };
      } else if (data.source === 'tier') {
        const sourceTierIdx = data.tierIndex;
        const sourceItemIdx = data.itemIndex;

        if (sourceTierIdx === unassignedIdx) return; // Already in pool

        const itemToMove = updatedTiers[sourceTierIdx].items[sourceItemIdx];
        
        // Remove from source
        updatedTiers[sourceTierIdx] = {
          ...updatedTiers[sourceTierIdx],
          items: updatedTiers[sourceTierIdx].items.filter((_, i) => i !== sourceItemIdx)
        };

        // Append to pool
        updatedTiers[unassignedIdx] = {
          ...updatedTiers[unassignedIdx],
          items: [...updatedTiers[unassignedIdx].items, itemToMove]
        };
      }

      setTiers(updatedTiers);
    } catch (err) {
      console.error('Failed to handle drop on pool:', err);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (searchQuery.trim().length >= 2) {
      searchTimerRef.current = setTimeout(() => {
        dispatch(searchContentThunk({ query: searchQuery, contentType: selectedType }));
      }, 500);
    } else {
      dispatch(clearSearchResults());
    }

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, selectedType, dispatch]);

  const handleAddTier = () => {
    const randomColors = ['#f72585', '#7209b7', '#3f37c9', '#4cc9f0', '#ffb703', '#fb8500', '#2ec4b6'];
    const newColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    setTiers([...tiers, { name: 'NEW', color: newColor, items: [] }]);
  };

  const handleRemoveTier = (idx: number) => {
    if (tiers.length <= 1) {
      alert('You must have at least one tier!');
      return;
    }
    const updated = tiers.filter((_, i) => i !== idx);
    setTiers(updated);
  };

  const handleUpdateTierName = (idx: number, newName: string) => {
    const updated = [...tiers];
    updated[idx] = { ...updated[idx], name: newName };
    setTiers(updated);
  };

  const handleUpdateTierColor = (idx: number, newColor: string) => {
    const updated = [...tiers];
    updated[idx] = { ...updated[idx], color: newColor };
    setTiers(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a tier list name.');
      return;
    }

    const payload = {
      name: name.trim(),
      tiers,
      is_public: isPublic
    };

    let resultAction;
    if (id) {
      resultAction = await dispatch(updateTierListThunk({ id, data: payload }));
    } else {
      resultAction = await dispatch(createTierListThunk(payload));
    }

    if (createTierListThunk.fulfilled.match(resultAction) || updateTierListThunk.fulfilled.match(resultAction)) {
      navigate('/games/tier-lists');
    }
  };

  // --- HTML5 Drag & Drop Handlers ---
  const handleDragStartSearch = (e: React.DragEvent, item: any) => {
    const dragData = {
      source: 'search',
      item: {
        content_type: item.content_type,
        content_id: item.content_id,
        name: item.name,
        image: item.image
      }
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
  };

  const handleDragStartTier = (e: React.DragEvent, tierIndex: number, itemIndex: number, item: TierListItem) => {
    const dragData = {
      source: 'tier',
      tierIndex,
      itemIndex,
      item
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
  };

  const handleDragOverTier = (e: React.DragEvent, tierIndex: number) => {
    e.preventDefault();
    if (dragOverTierIdx !== tierIndex) {
      setDragOverTierIdx(tierIndex);
    }
  };

  const handleDragLeaveTier = () => {
    setDragOverTierIdx(null);
  };

  const handleDropOnTier = (e: React.DragEvent, targetTierIndex: number) => {
    e.preventDefault();
    setDragOverTierIdx(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data) return;

      const updatedTiers = [...tiers];

      if (data.source === 'search') {
        // Prevent duplicate items in the same tier list
        const exists = updatedTiers.some(t => t.items.some(i => i.content_id === data.item.content_id));
        if (exists) {
          alert('Item is already added to a tier!');
          return;
        }
        updatedTiers[targetTierIndex] = {
          ...updatedTiers[targetTierIndex],
          items: [...updatedTiers[targetTierIndex].items, data.item]
        };
      } else if (data.source === 'tier') {
        const sourceTierIdx = data.tierIndex;
        const sourceItemIdx = data.itemIndex;

        if (sourceTierIdx === targetTierIndex) return; // Dropped on same row outer space

        // Remove from source
        const itemToMove = updatedTiers[sourceTierIdx].items[sourceItemIdx];
        const sourceItems = updatedTiers[sourceTierIdx].items.filter((_, i) => i !== sourceItemIdx);
        updatedTiers[sourceTierIdx] = { ...updatedTiers[sourceTierIdx], items: sourceItems };

        // Append to target
        updatedTiers[targetTierIndex] = {
          ...updatedTiers[targetTierIndex],
          items: [...updatedTiers[targetTierIndex].items, itemToMove]
        };
      }

      setTiers(updatedTiers);
    } catch (err) {
      console.error('Failed to handle drop:', err);
    }
  };

  const handleDropOnItem = (e: React.DragEvent, targetTierIndex: number, targetItemIndex: number) => {
    e.stopPropagation();
    e.preventDefault();
    setDragOverTierIdx(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (!data) return;

      const updatedTiers = [...tiers];

      if (data.source === 'search') {
        const exists = updatedTiers.some(t => t.items.some(i => i.content_id === data.item.content_id));
        if (exists) {
          alert('Item is already added to a tier!');
          return;
        }
        const targetItems = [...updatedTiers[targetTierIndex].items];
        targetItems.splice(targetItemIndex, 0, data.item);
        updatedTiers[targetTierIndex] = { ...updatedTiers[targetTierIndex], items: targetItems };
      } else if (data.source === 'tier') {
        const sourceTierIdx = data.tierIndex;
        const sourceItemIdx = data.itemIndex;

        const itemToMove = updatedTiers[sourceTierIdx].items[sourceItemIdx];

        if (sourceTierIdx === targetTierIndex) {
          // Reordering within the same tier
          const targetItems = [...updatedTiers[sourceTierIdx].items];
          // Remove
          targetItems.splice(sourceItemIdx, 1);
          // Insert
          targetItems.splice(targetItemIndex, 0, itemToMove);
          updatedTiers[sourceTierIdx] = { ...updatedTiers[sourceTierIdx], items: targetItems };
        } else {
          // Reordering between different tiers
          // Remove from source
          const sourceItems = updatedTiers[sourceTierIdx].items.filter((_, i) => i !== sourceItemIdx);
          updatedTiers[sourceTierIdx] = { ...updatedTiers[sourceTierIdx], items: sourceItems };

          // Insert into target
          const targetItems = [...updatedTiers[targetTierIndex].items];
          targetItems.splice(targetItemIndex, 0, itemToMove);
          updatedTiers[targetTierIndex] = { ...updatedTiers[targetTierIndex], items: targetItems };
        }
      }

      setTiers(updatedTiers);
    } catch (err) {
      console.error('Failed to handle drop on item:', err);
    }
  };

  const removeItemFromTier = (tierIndex: number, itemIndex: number) => {
    const updated = [...tiers];
    const itemsList = updated[tierIndex].items.filter((_, i) => i !== itemIndex);
    updated[tierIndex] = { ...updated[tierIndex], items: itemsList };
    setTiers(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <button
          onClick={() => navigate('/games/tier-lists')}
          className="flex items-center space-x-2 text-xs font-semibold text-anime-text hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lists</span>
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-anime-primary text-anime-bg hover:bg-white disabled:opacity-50 transition-all font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-anime-primary/10 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{id ? 'Save Changes' : 'Create Tier List'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center space-x-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workspace Canvas (Left side, takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-6 rounded-2xl border border-anime-border/30 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-anime-primary animate-pulse" />
              <span>Workspace Properties</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
              {/* Name input */}
              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] text-anime-text/50 font-bold uppercase tracking-wider">Tier List Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Favorite Jujutsu Sorcerers"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary"
                />
              </div>

              {/* Public/Private Toggle */}
              <div className="flex items-center space-x-2 bg-white/5 p-1.5 rounded-xl border border-white/5 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1 cursor-pointer ${
                    isPublic ? 'bg-green-500/20 text-green-300' : 'text-anime-text hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1 cursor-pointer ${
                    !isPublic ? 'bg-red-500/20 text-red-300' : 'text-anime-text hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private</span>
                </button>
              </div>
            </div>
          </div>

          {/* TIER LIST CONTAINER */}
          {/* TIER LIST CONTAINER */}
          <div className="flex flex-col space-y-2.5 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
            {tiers.map((tier, tierIdx) => {
              if (tier.name === 'Unassigned') return null;
              return (
                <div
                  key={tierIdx}
                  onDragOver={(e) => handleDragOverTier(e, tierIdx)}
                  onDragLeave={handleDragLeaveTier}
                  onDrop={(e) => handleDropOnTier(e, tierIdx)}
                  className={`flex rounded-xl overflow-hidden min-h-[72px] border transition-all duration-300 ${
                    dragOverTierIdx === tierIdx
                      ? 'border-anime-primary bg-anime-primary/5 shadow-[0_0_15px_rgba(102,252,241,0.05)] scale-[1.01]'
                      : 'border-white/5 bg-white/5'
                  }`}
                >
                  {/* Left swatch & controls */}
                  <div
                    className="w-24 sm:w-28 flex flex-col justify-between p-2 shrink-0 border-r border-black/20"
                    style={{ backgroundColor: tier.color }}
                  >
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => handleUpdateTierName(tierIdx, e.target.value)}
                      className="w-full text-center bg-transparent border-b border-transparent hover:border-black/20 focus:border-black/40 text-anime-bg font-black text-sm uppercase outline-none font-outfit"
                      maxLength={10}
                    />
                    <div className="flex justify-between items-center mt-auto">
                      <input
                        type="color"
                        value={tier.color}
                        onChange={(e) => handleUpdateTierColor(tierIdx, e.target.value)}
                        className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0 shrink-0"
                      />
                      <button
                        onClick={() => handleRemoveTier(tierIdx)}
                        className="p-1 hover:bg-black/15 text-anime-bg hover:text-red-700 rounded transition-all cursor-pointer shrink-0"
                        title="Remove tier row"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Items drop area */}
                  <div className="flex-1 flex items-center gap-2 px-3 overflow-x-auto py-1">
                    {tier.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        draggable
                        onDragStart={(e) => handleDragStartTier(e, tierIdx, itemIdx, item)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropOnItem(e, tierIdx, itemIdx)}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 relative group shrink-0 shadow-md cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeItemFromTier(tierIdx, itemIdx)}
                          className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {tier.items.length === 0 && (
                      <span className="text-[10px] text-anime-text/30 italic select-none">
                        Drag and drop items here...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Unassigned Bottom Pool (Horizontal Swath) */}
            {(() => {
              const uIdx = tiers.findIndex(t => t.name === 'Unassigned');
              const unassignedTier = uIdx !== -1 ? tiers[uIdx] : { name: 'Unassigned', color: 'transparent', items: [] };
              return (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverPool(true);
                  }}
                  onDragLeave={() => setDragOverPool(false)}
                  onDrop={(e) => handleDropOnPool(e)}
                  className={`flex flex-col p-4 rounded-xl border transition-all duration-300 mt-6 min-h-[120px] ${
                    dragOverPool
                      ? 'border-anime-primary bg-anime-primary/10 shadow-[0_0_20px_rgba(102,252,241,0.1)]'
                      : 'border-white/10 bg-black/40'
                  }`}
                >
                  <span className="text-[10px] text-anime-text/50 font-bold uppercase tracking-wider mb-3 select-none">
                    Unassigned Item Pool (Drag items here to unassign, or drag to tiers to rank)
                  </span>
                  <div className="flex flex-wrap gap-3 items-center min-h-[60px]">
                    {unassignedTier.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        draggable
                        onDragStart={(e) => handleDragStartTier(e, uIdx, itemIdx, item)}
                        className="w-16 h-16 rounded-xl overflow-hidden border border-white/15 relative group shrink-0 shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-200"
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeItemFromTier(uIdx, itemIdx)}
                          className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {unassignedTier.items.length === 0 && (
                      <span className="text-[10px] text-anime-text/30 italic select-none">
                        Unassigned items will appear here. Search on the right and click "Add" to populate this pool.
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          <button
            onClick={handleAddTier}
            className="w-full py-3 bg-white/5 border border-dashed border-white/10 hover:border-anime-primary text-anime-text hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Row / Tier</span>
          </button>
        </div>

        {/* Content Search & Pool (Right side, 1 col) */}
        <div className="space-y-4">
          <div className="premium-card p-6 rounded-2xl border border-anime-border/30 space-y-4 h-fit">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Search className="w-4 h-4 text-anime-primary animate-pulse" />
              <span>Search Content Pool</span>
            </h3>

            {/* Inputs & Dropdown */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type character/anime name..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-anime-primary"
                />
                <Search className="w-4 h-4 text-anime-text/40 absolute left-3 top-3.5" />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-anime-primary cursor-pointer"
              >
                <option value="" className="bg-anime-bg">All Categories</option>
                <option value="character" className="bg-anime-bg">Characters</option>
                <option value="anime" className="bg-anime-bg">Anime</option>
                <option value="manga" className="bg-anime-bg">Manga</option>
                <option value="movie" className="bg-anime-bg">Movies</option>
                <option value="tv_series" className="bg-anime-bg">TV Series</option>
              </select>
            </div>

            {/* Search results list */}
            <div className="border border-white/5 rounded-xl bg-black/30 p-3 h-96 overflow-y-auto space-y-2 shadow-inner">
              {searchLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <Loader2 className="w-6 h-6 text-anime-primary animate-spin" />
                  <p className="text-[10px] text-anime-text/40">Searching database...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {searchResults.map((item) => (
                    <div
                      key={`${item.content_type}-${item.content_id}`}
                      draggable
                      onDragStart={(e) => handleDragStartSearch(e, item)}
                      className="p-3 bg-white/5 border border-white/5 hover:border-anime-primary/40 hover:bg-white/10 rounded-lg flex flex-col items-center text-center space-y-2 cursor-grab active:cursor-grabbing group transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Move className="w-4 h-4 text-anime-primary" />
                        </div>
                      </div>
                      <div className="w-full">
                        <p className="text-[9px] text-anime-secondary uppercase font-bold tracking-wider leading-none">
                          {item.content_type === 'tv_series' ? 'TV' : item.content_type}
                        </p>
                        <p className="text-[10px] font-bold text-white line-clamp-1 mt-0.5 leading-tight">
                          {item.name}
                        </p>
                      </div>

                      {/* Add/Remove Action Buttons */}
                      <div className="w-full pt-1.5 flex justify-center mt-auto">
                        {isItemAdded(item.content_id) ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveSearchItem(item.content_id)}
                            className="w-full py-1 bg-red-600/20 border border-red-600/30 hover:bg-red-600/40 text-red-300 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddSearchItem(item)}
                            className="w-full py-1 bg-anime-primary/20 border border-anime-primary/30 hover:bg-anime-primary/40 text-anime-primary text-[9px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center px-4">
                  <p className="text-[10px] text-anime-text/30 italic leading-relaxed">
                    {searchQuery.trim().length < 2
                      ? 'Enter at least 2 characters to search the library...'
                      : 'No results found. Try a different query.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TierListEditor;
