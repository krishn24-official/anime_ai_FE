import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import {
  fetchMyTierListsThunk,
  fetchPublicTierListsThunk,
  deleteTierListThunk
} from '../../store/slices/tierListSlice';
import { Plus, Eye, Edit2, Trash2, Globe, Lock, Loader2 } from 'lucide-react';
import type { TierList } from '../../types';

const TierListList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { myLists, publicLists, publicTotal, loading, error } = useSelector((state: RootState) => state.tierList);

  const [activeSubTab, setActiveSubTab] = useState<'my' | 'public'>('my');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9;

  useEffect(() => {
    if (activeSubTab === 'my') {
      dispatch(fetchMyTierListsThunk());
    } else {
      dispatch(fetchPublicTierListsThunk({ page: currentPage, limit }));
    }
  }, [activeSubTab, currentPage, dispatch]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this tier list?')) {
      dispatch(deleteTierListThunk(id));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderListGrid = (lists: TierList[], isOwn: boolean) => {
    if (lists.length === 0) {
      return (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 space-y-4">
          <p className="text-sm text-anime-text/60 italic">
            {isOwn ? "You haven't created any tier lists yet!" : "No public tier lists found."}
          </p>
          {isOwn && (
            <button
              onClick={() => navigate('/games/tier-lists/create')}
              className="px-6 py-2.5 bg-anime-primary text-anime-bg hover:bg-white transition-all text-xs font-bold rounded-xl flex items-center space-x-2 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Tier List</span>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <div
            key={list.id}
            onClick={() => navigate(isOwn ? `/games/tier-lists/edit/${list.id}` : `/games/tier-lists/view/${list.id}`)}
            className="premium-card p-6 rounded-2xl flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden group border border-anime-border/30 hover:border-anime-primary/40"
          >
            <div>
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <h3 className="font-bold font-outfit text-white text-base group-hover:text-anime-primary transition-all line-clamp-1">
                  {list.name}
                </h3>
                {isOwn && (
                  <span className={`flex items-center space-x-1 text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                    list.is_public ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {list.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{list.is_public ? 'Public' : 'Private'}</span>
                  </span>
                )}
              </div>

              {/* Created At / Subtitle */}
              <p className="text-[10px] text-anime-text/50 mt-1">
                Updated: {new Date(list.updated_at).toLocaleDateString()}
              </p>

              {/* Tiers preview grid */}
              <div className="flex flex-col space-y-1.5 mt-4">
                {list.tiers.slice(0, 3).map((tier, idx) => (
                  <div key={idx} className="flex items-center bg-black/30 rounded-md overflow-hidden border border-white/5 h-8">
                    <div
                      className="w-10 h-full flex items-center justify-center text-[10px] font-bold text-anime-bg"
                      style={{ backgroundColor: tier.color }}
                    >
                      {tier.name}
                    </div>
                    <div className="flex-1 flex items-center space-x-1.5 px-2 overflow-x-hidden">
                      {tier.items.slice(0, 4).map((item, itemIdx) => (
                        <img
                          key={itemIdx}
                          src={item.image}
                          alt={item.name}
                          className="w-6 h-6 rounded-md object-cover border border-white/10 shrink-0"
                        />
                      ))}
                      {tier.items.length > 4 && (
                        <span className="text-[8px] text-anime-text/40">+{tier.items.length - 4}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions row */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-white/5 mt-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/games/tier-lists/view/${list.id}`);
                }}
                className="p-2 bg-white/5 hover:bg-anime-primary/20 border border-white/10 hover:border-anime-primary/50 text-white rounded-lg transition-all cursor-pointer"
                title="View read-only"
              >
                <Eye className="w-4 h-4" />
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/games/tier-lists/edit/${list.id}`);
                    }}
                    className="p-2 bg-white/5 hover:bg-anime-secondary/20 border border-white/10 hover:border-anime-secondary/50 text-white rounded-lg transition-all cursor-pointer"
                    title="Edit list"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, list.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/50 text-red-400 rounded-lg transition-all cursor-pointer"
                    title="Delete list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Select & Create New Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Toggle between My Lists / Browse Public */}
        <div className="flex flex-wrap gap-1 bg-white/5 p-1.5 rounded-xl border border-white/5 shrink-0 justify-center">
          <button
            onClick={() => {
              setActiveSubTab('my');
              setCurrentPage(1);
            }}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'my' ? 'bg-anime-primary text-anime-bg shadow-[0_0_12px_rgba(102,252,241,0.2)]' : 'text-anime-text hover:text-white'
            }`}
          >
            My Tier Lists
          </button>
          <button
            onClick={() => {
              setActiveSubTab('public');
              setCurrentPage(1);
            }}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'public' ? 'bg-anime-primary text-anime-bg shadow-[0_0_12px_rgba(102,252,241,0.2)]' : 'text-anime-text hover:text-white'
            }`}
          >
            Browse Public
          </button>
        </div>

        {/* Create new button */}
        <button
          onClick={() => navigate('/games/tier-lists/create')}
          className="px-6 py-2.5 bg-gradient-to-r from-anime-primary to-anime-secondary hover:scale-105 transition-all text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New List</span>
        </button>
      </div>

      {/* Main loading or lists */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-anime-primary animate-spin" />
          <p className="text-sm text-anime-text/60">Fetching lists...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl text-center text-red-400 text-xs">
          {error}
        </div>
      ) : activeSubTab === 'my' ? (
        renderListGrid(myLists, true)
      ) : (
        <div className="space-y-8">
          {renderListGrid(publicLists, false)}
          
          {/* Pagination for public lists */}
          {publicTotal > limit && (
            <div className="flex justify-center items-center space-x-2 pt-4">
              {Array.from({ length: Math.ceil(publicTotal / limit) }).map((_, idx) => {
                const p = idx + 1;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p
                        ? 'bg-anime-primary text-anime-bg'
                        : 'bg-white/5 border border-white/10 text-white hover:border-anime-primary'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TierListList;
