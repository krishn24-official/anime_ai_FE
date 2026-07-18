import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { actorService, type ActorItem } from '../../services/actorService';
import { actorAdminService } from '../../services/actorAdminService';
import { ActorForm } from './ActorForm';

export const AdminActors: React.FC = () => {
  const [actors, setActors] = useState<ActorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActor, setEditingActor] = useState<ActorItem | null>(null);

  const fetchActors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (search.trim()) {
        data = await actorService.searchActors(search);
        setActors(data);
      } else {
        const response = await actorService.listActors(1, 100);
        setActors(response.items);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch actors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchActors();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleDelete = async (actorId: string) => {
    if (!window.confirm("Are you sure you want to delete this actor?")) return;
    try {
      await actorAdminService.deleteActor(actorId);
      fetchActors();
    } catch (err: any) {
      alert("Failed to delete actor: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Manage Actors & Directors</h1>
          <p className="text-white/60">Add, edit, or remove actors and directors.</p>
        </div>
        
        <button
          onClick={() => { setEditingActor(null); setIsFormOpen(true); }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Actor
        </button>
      </div>

      <div className="bg-[#0B0B0C] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search actors by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-red-500 bg-red-500/10 m-4 rounded-xl">
            {error}
          </div>
        ) : loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : actors.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            No actors found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-sm font-medium text-white/50">Actor</th>
                  <th className="p-4 text-sm font-medium text-white/50">Birthdate</th>
                  <th className="p-4 text-sm font-medium text-white/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {actors.map(actor => (
                  <tr key={actor._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={actor.images?.profile || 'https://via.placeholder.com/150'} 
                          alt={actor.name} 
                          className="w-12 h-12 rounded-lg object-cover bg-white/5"
                        />
                        <div>
                          <div className="font-medium text-white mb-1">{actor.name}</div>
                          <div className="text-xs text-white/50">{actor._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white/70 text-sm">
                      {actor.birthdate || 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingActor(actor); setIsFormOpen(true); }}
                          className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(actor._id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-white/70 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <ActorForm
          initialData={editingActor}
          onSuccess={() => { setIsFormOpen(false); fetchActors(); }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};
