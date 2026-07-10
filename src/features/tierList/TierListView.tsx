import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchTierListByIdThunk, clearCurrentList } from '../../store/slices/tierListSlice';
import { ArrowLeft, Loader2, Globe, Lock } from 'lucide-react';

const TierListView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentList, loading, error } = useSelector((state: RootState) => state.tierList);

  useEffect(() => {
    if (id) {
      dispatch(fetchTierListByIdThunk(id));
    }
    return () => {
      dispatch(clearCurrentList());
    };
  }, [id, dispatch]);

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
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-anime-primary animate-spin" />
          <p className="text-sm text-anime-text/60">Loading tier list...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl text-center text-red-400 text-xs">
          {error}
        </div>
      ) : currentList ? (
        <div className="space-y-6">
          {/* List Title Card */}
          <div className="premium-card p-6 rounded-2xl border border-anime-border/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-anime-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-2xl font-bold font-fraunces text-white neon-glow-primary">
                  {currentList.name}
                </h2>
                <span className={`flex items-center space-x-1 text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                  currentList.is_public ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {currentList.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{currentList.is_public ? 'Public' : 'Private'}</span>
                </span>
              </div>
              <p className="text-xs text-anime-text/60">
                Created: {new Date(currentList.created_at).toLocaleDateString()} • Last Updated: {new Date(currentList.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Tier visual stack */}
          <div className="flex flex-col space-y-2.5 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
            {currentList.tiers.filter(t => t.name !== 'Unassigned').map((tier, idx) => (
              <div
                key={idx}
                className="flex rounded-xl overflow-hidden min-h-[72px] border border-white/5 bg-white/5"
              >
                {/* Colored Tier Swatch */}
                <div
                  className="w-24 sm:w-28 flex items-center justify-center p-2 shrink-0 border-r border-black/20 text-anime-bg font-black text-base uppercase font-inter text-center break-all"
                  style={{ backgroundColor: tier.color }}
                >
                  {tier.name}
                </div>

                {/* Items scrolling container */}
                <div className="flex-1 flex items-center gap-3 px-4 overflow-x-auto py-1">
                  {tier.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 relative group shrink-0 shadow-md transition-transform duration-200 hover:scale-105"
                      title={item.name}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center p-1">
                        <span className="text-[8px] text-anime-secondary uppercase font-bold tracking-wider leading-none">
                          {item.content_type === 'tv_series' ? 'TV' : item.content_type}
                        </span>
                        <span className="text-[8px] font-bold text-white line-clamp-1 mt-0.5 leading-tight">
                          {item.name}
                        </span>
                      </div>
                    </div>
                  ))}
                  {tier.items.length === 0 && (
                    <span className="text-[10px] text-anime-text/20 italic select-none">
                      No items placed in this tier
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Unassigned Bottom Pool (Horizontal Swath) */}
            {(() => {
              const unassignedTier = currentList.tiers.find(t => t.name === 'Unassigned');
              if (!unassignedTier || unassignedTier.items.length === 0) return null;
              return (
                <div className="flex flex-col p-4 rounded-xl border border-white/10 bg-black/40 mt-6 min-h-[100px]">
                  <span className="text-[10px] text-anime-text/50 font-bold uppercase tracking-wider mb-3 select-none">
                    Unassigned Item Pool
                  </span>
                  <div className="flex flex-wrap gap-3 items-center">
                    {unassignedTier.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="w-16 h-16 rounded-xl overflow-hidden border border-white/15 relative group shrink-0 shadow-lg hover:scale-105 transition-transform duration-200"
                        title={item.name}
                      >
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center p-1">
                          <span className="text-[8px] text-anime-secondary uppercase font-bold tracking-wider leading-none">
                            {item.content_type === 'tv_series' ? 'TV' : item.content_type}
                          </span>
                          <span className="text-[8px] font-bold text-white line-clamp-1 mt-0.5 leading-tight">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TierListView;
