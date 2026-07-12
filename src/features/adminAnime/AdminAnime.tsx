import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { animeAdminService } from '../../services/animeAdminService';
import type { AdminAnimeItem } from '../../services/animeAdminService';
import { AnimeForm } from './AnimeForm';

const renderDate = (dateObj: any) => {
  if (!dateObj) return null;
  if (dateObj.precision === 'day') return `${dateObj.year}-${String(dateObj.month).padStart(2,'0')}-${String(dateObj.day).padStart(2,'0')}`;
  if (dateObj.precision === 'month') return `${dateObj.year}-${String(dateObj.month).padStart(2,'0')}`;
  return `${dateObj.year}`;
};

export const AdminAnime: React.FC = () => {
  const [items, setItems] = useState<AdminAnimeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminAnimeItem | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await animeAdminService.listAnimeAdmin({
        search: search || undefined,
        include_deleted: includeDeleted,
        needs_review: needsReview,
        limit: 20,
        skip: page * 20
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to fetch anime list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, includeDeleted, needsReview, page]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this anime?")) {
      try {
        await animeAdminService.deleteAnime(id);
        fetchItems();
      } catch (err) {
        alert("Failed to delete anime");
      }
    }
  };

  const handleEdit = (item: AdminAnimeItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Anime</h1>
          <p className="text-white/60">Create, edit, or remove anime entries directly from the database.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-anime-primary text-white rounded-xl font-bold hover:bg-anime-primary/80 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Anime
        </button>
      </div>

      <div className="bg-anime-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input 
            type="text" 
            placeholder="Search titles..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="bg-anime-secondary border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-anime-primary w-full sm:w-64"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={needsReview} onChange={e => { setNeedsReview(e.target.checked); setPage(0); }} />
              Needs Review
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" checked={includeDeleted} onChange={e => { setIncludeDeleted(e.target.checked); setPage(0); }} />
              Include Deleted
            </label>
            <button onClick={fetchItems} className="text-white/50 hover:text-white transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02] text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Release Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-anime-primary mx-auto" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                    No anime found matching criteria
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item._id} className={`hover:bg-white/[0.02] transition-colors ${item.is_deleted ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.images?.poster || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100'} 
                          alt="Poster"
                          className="w-12 h-16 object-cover rounded-md"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{item.title?.english || item.title?.romaji}</p>
                          {item.needs_release_review && (
                            <span className="inline-flex mt-1 mb-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-red-500/20 text-red-400 border border-red-500/30">
                              Review: Est. Date Passed
                            </span>
                          )}
                          <p className="text-xs text-white/50">{item._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-md shadow-lg backdrop-blur-md ${
                        item.status === 'upcoming' 
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          : item.status === 'ongoing'
                          ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                          : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70 whitespace-nowrap">
                      {item.release_date ? (
                        <>
                          {renderDate(item.release_date)}
                          {item.end_date && ` to ${renderDate(item.end_date)}`}
                        </>
                      ) : (
                        item.season && item.year ? `${item.season} ${item.year}` : item.year || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!item.is_deleted && (
                          <button 
                            onClick={() => handleDelete(item._id)}
                            className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && total > 20 && (
          <div className="p-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-sm text-white/50">Showing {page * 20 + 1} to {Math.min((page + 1) * 20, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-white/5 text-white rounded hover:bg-white/10 disabled:opacity-50">Prev</button>
              <button disabled={(page + 1) * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-white/5 text-white rounded hover:bg-white/10 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {isFormOpen && (
        <AnimeForm 
          initialData={editingItem} 
          onCancel={() => setIsFormOpen(false)} 
          onSuccess={() => { setIsFormOpen(false); fetchItems(); }} 
        />
      )}
    </div>
  );
};
