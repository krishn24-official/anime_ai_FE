// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { tvSeriesAdminService } from '../../services/tvSeriesAdminService';
import type { AdminTvSeriesItem } from '../../services/tvSeriesAdminService';
import { Trash2, Edit2, Loader2, Plus, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { TvSeriesForm } from './TvSeriesForm';

const renderDate = (dateObj: any) => {
  if (!dateObj) return null;
  if (dateObj.precision === 'day') return `${dateObj.year}-${String(dateObj.month).padStart(2,'0')}-${String(dateObj.day).padStart(2,'0')}`;
  if (dateObj.precision === 'month') return `${dateObj.year}-${String(dateObj.month).padStart(2,'0')}`;
  return `${dateObj.year}`;
};

export const AdminTvSeries: React.FC = () => {
  const [items, setItems] = useState<AdminTvSeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminTvSeriesItem | null>(null);
  
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tvSeriesAdminService.listTvSeriesAdmin(
        includeDeleted, 
        search, 
        limit, 
        (page - 1) * limit,
        needsReview
      );
      setItems(data.items);
      setTotalPages(data.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load TV series');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [includeDeleted, needsReview, search, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleEdit = (item: AdminTvSeriesItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (contentId: string) => {
    if (!window.confirm('Are you sure you want to soft-delete this TV series?')) return;
    try {
      await tvSeriesAdminService.deleteTvSeries(contentId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    loadData();
  };

  const activeTabClass = "px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-anime-primary text-white";
  const inactiveTabClass = "px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-white/5 text-white/50 hover:bg-white/10 hover:text-white";

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Manage TV Series</h1>
          <p className="text-white/50 text-sm">Create, update, and review TV series catalog</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setShowForm(true); }}
          className="flex items-center px-4 py-2 bg-anime-primary hover:bg-anime-primary/80 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add TV Series
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <button 
            onClick={() => { setNeedsReview(false); setPage(1); }}
            className={!needsReview ? activeTabClass : inactiveTabClass}
          >
            All TV Series
          </button>
          <button 
            onClick={() => { setNeedsReview(true); setPage(1); }}
            className={`flex items-center gap-2 ${needsReview ? activeTabClass : inactiveTabClass}`}
          >
            <AlertCircle className="w-4 h-4" />
            Needs Release Review
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-anime-primary transition-colors w-64"
            />
          </form>
          
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input 
              type="checkbox" 
              checked={includeDeleted} 
              onChange={e => { setIncludeDeleted(e.target.checked); setPage(1); }}
              className="rounded border-white/10 bg-white/5"
            />
            Include Deleted
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-anime-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Air Dates</th>
                <th className="px-6 py-4 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-anime-primary mx-auto" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/50">
                    No TV series found
                  </td>
                </tr>
              ) : items.map(item => (
                <tr key={item._id} className={`hover:bg-white/[0.02] transition-colors ${item.is_deleted ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm">{item.title}</p>
                          {item.needs_release_review && (
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              <AlertCircle className="w-3 h-3" />
                              Review: Est. Date Passed
                            </span>
                          )}
                          <p className="text-xs text-white/50">{item._id}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-md shadow-lg backdrop-blur-md ${
                      item.status === 'Planned' || item.status === 'Pilot' || item.status === 'In Production'
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                        : item.status === 'Returning Series'
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                        : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70 whitespace-nowrap">
                    {item.first_air_date || item.first_air_precision ? (
                      <>
                        {renderDate(item.first_air_precision) || item.first_air_date}
                        {(item.last_air_date || item.last_air_precision) && ` to ${renderDate(item.last_air_precision) || item.last_air_date}`}
                      </>
                    ) : (
                      item.year || '-'
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
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
            <span className="text-sm text-white/50">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white rounded text-sm transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white rounded text-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <TvSeriesForm 
          onSuccess={handleFormSuccess} 
          onCancel={() => { setShowForm(false); setEditingItem(null); }} 
          initialData={editingItem} 
        />
      )}
    </div>
  );
};
