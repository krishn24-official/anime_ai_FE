import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { characterAdminService, type AdminCharacterItem } from '../../services/characterAdminService';
import { CharacterForm } from './CharacterForm';

export const AdminCharacters: React.FC = () => {
  const [items, setItems] = useState<AdminCharacterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminCharacterItem | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await characterAdminService.listCharactersAdmin({
        search: search || undefined,
        include_deleted: includeDeleted,
        limit: 20,
        skip: page * 20
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to fetch characters", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, includeDeleted, page]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await characterAdminService.deleteCharacter(id);
        fetchItems();
      } catch (err) {
        alert("Failed to delete character");
      }
    }
  };

  const handleEdit = (item: AdminCharacterItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    fetchItems();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Manage Characters</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          <Plus size={18} className="mr-2" />
          Add Character
        </button>
      </div>

      {isFormOpen ? (
        <CharacterForm 
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          initialData={editingItem}
        />
      ) : (
        <div className="bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden">
          <div className="p-4 border-b border-[#333] flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 min-w-[300px]">
              <input
                type="text"
                placeholder="Search characters by name..."
                className="flex-1 bg-[#252525] border border-[#333] rounded px-4 py-2 text-white"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center text-gray-400 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => {
                    setIncludeDeleted(e.target.checked);
                    setPage(0);
                  }}
                  className="mr-2"
                />
                Show Deleted
              </label>
              <button 
                onClick={fetchItems}
                className="p-2 text-gray-400 hover:text-white rounded hover:bg-[#333]"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs uppercase bg-[#252525] text-gray-300">
                <tr>
                  <th className="px-6 py-3">Character</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Gender</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                      <p>Loading characters...</p>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No characters found
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item._id} className={`border-b border-[#333] hover:bg-[#252525] ${item.is_deleted ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                        {item.images?.profile ? (
                          <img src={item.images.profile} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-xs">No Img</div>
                        )}
                        <div>
                          <div>{item.name}</div>
                          {item.native_name && <div className="text-xs text-gray-500">{item.native_name}</div>}
                          {item.is_deleted && <span className="text-xs text-red-500 ml-2">(Deleted)</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.role === 'main' ? 'bg-blue-900/50 text-blue-200' : 
                          item.role === 'supporting' ? 'bg-purple-900/50 text-purple-200' : 
                          'bg-gray-800 text-gray-300'
                        }`}>
                          {item.role || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.gender || 'Unknown'}</td>
                      <td className="px-6 py-4 capitalize">{item.status || 'unknown'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded mr-2"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        {!item.is_deleted && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {total > 20 && (
            <div className="p-4 border-t border-[#333] flex justify-between items-center text-sm">
              <span className="text-gray-400">
                Showing {page * 20 + 1} to {Math.min((page + 1) * 20, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-[#252525] rounded text-white disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={(page + 1) * 20 >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-[#252525] rounded text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
