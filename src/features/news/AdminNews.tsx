import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { fetchCurrentUserThunk } from '../../store/slices/authSlice';
import { fetchNewsThunk } from '../../store/slices/newsSlice';
import { newsService } from '../../services/newsService';
import { 
  Sparkles, 
  Upload, 
  X, 
  Trash2, 
  Edit3, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Image as ImageIcon,
  FileText,
  Eye
} from 'lucide-react';

const AdminNews: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { items: newsItems } = useSelector((state: RootState) => state.news);

  // Tabs: 'upload' | 'manage'
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  
  // Guard Verification state
  const [isVerifying, setIsVerifying] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  
  // Form states (Upload)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Anime' | 'Games' | 'Movies' | 'TV Series'>('Anime');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Edit Modal states
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'Anime' | 'Games' | 'Movies' | 'TV Series'>('Anime');
  const [editDescription, setEditDescription] = useState('');
  const [isEditingSubmit, setIsEditingSubmit] = useState(false);

  // General Page states
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; liveLink?: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Guard check and profile refresh on mount
  useEffect(() => {
    const triggerCountdown = () => {
      setIsVerifying(false);
      const interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate('/');
          }
          return prev - 1;
        });
      }, 1000);
    };

    const verifyAdmin = async () => {
      try {
        const res = await dispatch(fetchCurrentUserThunk()).unwrap();
        if (!res.is_admin) {
          triggerCountdown();
        } else {
          setIsVerifying(false);
        }
      } catch {
        triggerCountdown();
      }
    };
    verifyAdmin();
    dispatch(fetchNewsThunk());
  }, [dispatch, navigate]);

  // Image Selection Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);

      const previewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previewUrls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submit (Upload)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setToast({ type: 'error', message: 'Title and description are required.' });
      return;
    }

    setFormLoading(true);
    setToast(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      await newsService.createNews(formData);
      
      setToast({ 
        type: 'success', 
        message: 'News post created successfully!', 
        liveLink: `/news` 
      });

      // Clear Form
      setTitle('');
      setDescription('');
      setCategory('Anime');
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh public news state
      dispatch(fetchNewsThunk());
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to upload news post.' });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news post?')) return;
    try {
      await newsService.deleteNews(id);
      setToast({ type: 'success', message: 'News post deleted successfully.' });
      dispatch(fetchNewsThunk());
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to delete post.' });
    }
  };

  // Edit Modal actions
  const openEditModal = (post: any) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditDescription(post.content || post.summary || '');
    
    // Map category string back to options
    const cat = post.category === 'TV-Series' ? 'TV Series' : post.category;
    setEditCategory(cat as any);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setIsEditingSubmit(true);
    setToast(null);

    try {
      const formData = new FormData();
      
      // Send only changed fields
      if (editTitle !== editingPost.title) {
        formData.append('title', editTitle);
      }
      const originalContent = editingPost.content || editingPost.summary || '';
      if (editDescription !== originalContent) {
        formData.append('description', editDescription);
      }
      const mappedOrigCat = editingPost.category === 'TV-Series' ? 'TV Series' : editingPost.category;
      if (editCategory !== mappedOrigCat) {
        formData.append('category', editCategory);
      }

      await newsService.editNews(editingPost.id, formData);
      
      setToast({ type: 'success', message: 'News post updated successfully!' });
      setEditingPost(null);
      dispatch(fetchNewsThunk());
    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Failed to update news post.' });
    } finally {
      setIsEditingSubmit(false);
    }
  };

  // Filter client-side for manually added news posts (marked as MANUAL or source === manual)
  const manualArticles = newsItems.filter(
    (item) => item.author === 'MANUAL' || item.author === 'manual'
  );

  // Render Loader during initial verify check
  if (authLoading || isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Loader2 className="w-10 h-10 text-anime-primary animate-spin" />
        <p className="text-anime-text text-sm">Verifying Admin privileges...</p>
      </div>
    );
  }

  // Render Access Denied Guard
  if (!currentUser || !currentUser.is_admin) {
    return (
      <div className="max-w-md mx-auto mt-20 glass-panel p-8 rounded-2xl border border-red-500/25 bg-red-500/5 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto animate-bounce" />
        <h2 className="text-2xl font-bold font-fraunces text-white">Access Denied</h2>
        <p className="text-anime-text text-sm leading-relaxed">
          You do not have the required permissions to view this page. Only administrators are allowed access.
        </p>
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-xs text-anime-text/70">
            Redirecting to Home in <strong className="text-white text-sm">{redirectCountdown}</strong> seconds...
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-glow-primary w-full py-3 bg-gradient-to-r from-anime-primary to-anime-secondary text-white font-bold rounded-xl transition-all cursor-pointer"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-white/5 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-8 h-8 text-anime-primary animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-bold font-fraunces text-white tracking-wide">
            Admin News Center
          </h1>
        </div>
        
        {/* Tab Selection */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl max-w-fit">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-anime-primary text-black font-bold shadow-md shadow-anime-primary/20'
                : 'text-anime-text/70 hover:text-white'
            }`}
          >
            Upload Post
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-anime-primary text-black font-bold shadow-md shadow-anime-primary/20'
                : 'text-anime-text/70 hover:text-white'
            }`}
          >
            Manage Posts ({manualArticles.length})
          </button>
        </div>
      </div>

      {/* Notifications Toast */}
      {toast && (
        <div className={`p-4 rounded-xl border flex items-start space-x-3 transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500/10 border-green-500/25 text-green-400' 
            : 'bg-red-500/10 border-red-500/25 text-red-400'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <div className="flex-1 text-sm">
            <span className="font-semibold">{toast.type === 'success' ? 'Success' : 'Error'}:</span> {toast.message}
            {toast.liveLink && (
              <div className="mt-2">
                <button
                  onClick={() => navigate(toast.liveLink!)}
                  className="inline-flex items-center space-x-1.5 text-xs text-anime-primary hover:underline font-bold"
                >
                  <span>View Live Article</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'upload' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Form */}
          <div className="lg:col-span-2 premium-card p-6 md:p-8 rounded-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-anime-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold font-fraunces text-white">Create News Article</h3>
              <p className="text-xs text-anime-text/60">Publish a new manually written article directly into the public feed.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Article Title <span className="text-anime-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chainsaw Man Season 2 Official Air Date Announced!"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-anime-primary transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Category <span className="text-anime-primary">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-anime-primary cursor-pointer [&>option]:bg-anime-bg"
                >
                  <option value="Anime">Anime</option>
                  <option value="Games">Games</option>
                  <option value="Movies">Movies</option>
                  <option value="TV Series">TV Series</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Article Content / Description <span className="text-anime-primary">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write the full news story here..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-anime-primary resize-y transition-all"
                />
              </div>

              {/* Multi-Image File Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Images (Optional, Multiple Allowed)
                </label>
                
                {/* Drag / Select Panel */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-anime-primary/40 bg-white/5 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-2 group"
                >
                  <Upload className="w-8 h-8 text-anime-text/50 group-hover:text-anime-primary group-hover:scale-110 transition-all duration-300" />
                  <p className="text-xs text-white font-semibold">Click to select files</p>
                  <p className="text-[10px] text-anime-text/60">Supports PNG, JPG, JPEG, WEBP</p>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={formLoading}
                className="btn-glow-primary w-full py-3.5 bg-gradient-to-r from-anime-primary to-anime-secondary hover:from-anime-purple hover:to-anime-pink text-white font-bold rounded-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Publishing Article...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Publish Article</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Previews Sidebar */}
          <div className="space-y-6">
            <div className="premium-card p-6 rounded-2xl space-y-4">
              <div className="border-b border-white/5 pb-2 flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-anime-primary" />
                <h3 className="text-sm font-bold font-fraunces text-white">Image Previews ({imagePreviews.length})</h3>
              </div>
              
              {imagePreviews.length === 0 ? (
                <div className="py-8 text-center text-anime-text/40 text-xs flex flex-col items-center justify-center space-y-2 border border-white/5 rounded-xl">
                  <ImageIcon className="w-8 h-8" />
                  <span>No images selected yet</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {imagePreviews.map((url, idx) => (
                    <div key={url} className="relative aspect-[16/11] rounded-xl overflow-hidden group border border-white/10">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all cursor-pointer"
                          title="Remove Image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-anime-secondary" />
                <span>Publication Tips</span>
              </h4>
              <ul className="text-[11px] text-anime-text/70 space-y-2 list-disc list-inside">
                <li>Double check names and spelling to maintain quality.</li>
                <li>Write clear, punchy headlines for higher user click-throughs.</li>
                <li>Add high-quality horizontal cover images.</li>
                <li>Articles are immediately live for all platform users.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Manage Posts Tab */
        <div className="premium-card p-6 md:p-8 rounded-2xl space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-lg font-bold font-fraunces text-white">Manage Manual News</h3>
            <p className="text-xs text-anime-text/60">View, update, or remove news articles that were manually published.</p>
          </div>

          {manualArticles.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <FileText className="w-12 h-12 text-anime-text/30 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Manually Uploaded News</h4>
              <p className="text-xs text-anime-text/50 max-w-sm mx-auto">
                Any articles you publish using the "Upload Post" tab will show up here for you to edit or delete.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {manualArticles.map((article) => (
                <div 
                  key={article.id}
                  className="p-4 bg-white/5 border border-white/5 hover:border-anime-border rounded-xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-4 min-w-0">
                    <img 
                      src={article.image} 
                      alt="" 
                      className="w-20 h-14 object-cover rounded-lg bg-white/5 border border-white/5 shrink-0" 
                    />
                    <div className="space-y-1 min-w-0">
                      <span className="px-2 py-0.5 bg-anime-primary/10 border border-anime-primary/20 text-anime-primary text-[9px] font-bold rounded uppercase tracking-wider">
                        {article.category}
                      </span>
                      <h4 className="text-sm font-semibold text-white truncate pr-4">{article.title}</h4>
                      <p className="text-[10px] text-anime-text/50">Published: {article.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => navigate('/news')}
                      className="p-2 bg-white/5 hover:bg-white/10 text-anime-text hover:text-white rounded-lg border border-white/5 transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
                      title="View Article Live"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => openEditModal(article)}
                      className="p-2 bg-anime-primary/10 hover:bg-anime-primary/20 text-anime-primary rounded-lg border border-anime-primary/20 transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
                      title="Edit Article"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Article Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-anime-bg border border-anime-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-anime-primary" />
                <h3 className="text-base font-bold font-fraunces text-white">Edit News Article</h3>
              </div>
              <button
                onClick={() => setEditingPost(null)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-anime-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-anime-primary cursor-pointer [&>option]:bg-anime-bg"
                >
                  <option value="Anime">Anime</option>
                  <option value="Games">Games</option>
                  <option value="Movies">Movies</option>
                  <option value="TV Series">TV Series</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider">Content / Description</label>
                <textarea
                  required
                  rows={6}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-anime-primary resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingSubmit}
                  className="px-5 py-2 bg-anime-primary text-black font-bold rounded-xl hover:bg-white hover:text-anime-primary transition-all duration-300 cursor-pointer disabled:opacity-50 flex items-center space-x-1.5 text-xs"
                >
                  {isEditingSubmit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
