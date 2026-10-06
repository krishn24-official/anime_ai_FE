import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  uploadLoreThunk,
  fetchLoreStatusThunk,
  deleteLoreThunk,
  clearUploadError,
  clearLastUploadResult,
  clearDeleteError,
} from '../../store/slices/loreAdminSlice';
import { searchService, type GlobalSearchResults } from '../../services/searchService';
import {
  BookOpen,
  Upload,
  Trash2,
  Search,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Database,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface SelectedSeries {
  id: string;
  title: string;
  type: 'anime' | 'movie' | 'tv_series' | 'manga';
  image?: string;
  year?: string | number;
}

export const AdminLore: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    uploading,
    uploadError,
    lastUploadResult,
    statusBySeriesId,
    statusLoading,
    statusError,
    deleting,
    deleteError,
  } = useSelector((state: RootState) => state.loreAdmin);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SelectedSeries[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Selection & upload state
  const [selectedSeries, setSelectedSeries] = useState<SelectedSeries | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Local notification banner dismissal
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Status for selected series
  const currentStatus = selectedSeries ? statusBySeriesId[selectedSeries.id] : null;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res: GlobalSearchResults = await searchService.globalSearch(searchQuery.trim());
        const items: SelectedSeries[] = [];

        // Map Anime
        (res.anime || []).forEach((a) => {
          const title = a.title?.english || a.title?.romaji || a.title?.japanese || 'Untitled Anime';
          items.push({
            id: a._id,
            title,
            type: 'anime',
            image: a.images?.poster,
            year: a.year,
          });
        });

        // Map Movies
        (res.movies || []).forEach((m) => {
          items.push({
            id: m._id,
            title: m.title || 'Untitled Movie',
            type: 'movie',
            image: m.images?.poster,
            year: m.year,
          });
        });

        // Map TV Series
        (res.tv_series || []).forEach((tv) => {
          items.push({
            id: tv._id,
            title: tv.title || 'Untitled TV Series',
            type: 'tv_series',
            image: tv.images?.poster,
            year: tv.year,
          });
        });

        // Map Manga
        (res.manga || []).forEach((mg) => {
          items.push({
            id: mg._id,
            title: mg.name || 'Untitled Manga',
            type: 'manga',
            image: mg.cover_image,
          });
        });

        setSearchResults(items);
        setIsDropdownOpen(items.length > 0);
      } catch (err) {
        console.error('Failed to search content for lore:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When a series is selected, fetch its lore status
  const handleSelectSeries = (series: SelectedSeries) => {
    setSelectedSeries(series);
    setIsDropdownOpen(false);
    setSearchQuery('');
    dispatch(clearUploadError());
    dispatch(clearLastUploadResult());
    dispatch(fetchLoreStatusThunk(series.id));
  };

  const handleClearSelectedSeries = () => {
    setSelectedSeries(null);
    setSelectedFile(null);
    setShowSuccessBanner(false);
    dispatch(clearUploadError());
    dispatch(clearLastUploadResult());
  };

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setSelectedFile(file);
        dispatch(clearUploadError());
      } else {
        alert('Please select a valid PDF (.pdf) file.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setSelectedFile(file);
        dispatch(clearUploadError());
      } else {
        alert('Please drop a valid PDF (.pdf) file.');
      }
    }
  };

  // Upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) {
      alert('Please select a series first.');
      return;
    }
    if (!selectedFile) {
      alert('Please choose a lore PDF file to upload.');
      return;
    }

    setShowSuccessBanner(false);
    const resultAction = await dispatch(
      uploadLoreThunk({
        file: selectedFile,
        seriesId: selectedSeries.id,
      })
    );

    if (uploadLoreThunk.fulfilled.match(resultAction)) {
      setShowSuccessBanner(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      dispatch(fetchLoreStatusThunk(selectedSeries.id));
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!selectedSeries) return;
    await dispatch(deleteLoreThunk(selectedSeries.id));
    setShowDeleteModal(false);
    dispatch(fetchLoreStatusThunk(selectedSeries.id));
  };

  // Type badge styling
  const renderTypeBadge = (type: SelectedSeries['type']) => {
    switch (type) {
      case 'anime':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-anime-primary/20 text-anime-primary border border-anime-primary/30">
            Anime
          </span>
        );
      case 'movie':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Movie
          </span>
        );
      case 'tv_series':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
            TV Series
          </span>
        );
      case 'manga':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Manga
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-anime-primary/10 border border-anime-primary/20 text-anime-primary">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-fraunces text-white tracking-wide">
                Lore RAG Ingestion
              </h1>
              <p className="text-xs md:text-sm text-anime-text/60 mt-0.5">
                Upload narrative documents, backstories, and lore PDFs to the semantic vector index.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-anime-text/50 font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 self-start md:self-auto">
          <Database className="w-4 h-4 text-anime-primary" />
          <span>MongoDB Atlas Vector Search</span>
        </div>
      </div>

      {/* Alerts */}
      {showSuccessBanner && lastUploadResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-start justify-between animate-fade-in">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-bold text-emerald-200">Lore Ingested Successfully!</p>
              <p className="text-xs text-emerald-300/80">
                Generated and indexed <span className="font-bold text-emerald-100">{lastUploadResult.chunks_created} chunks</span> from source file{' '}
                <span className="font-mono font-bold text-emerald-100">{lastUploadResult.source_file}</span> for series{' '}
                <span className="font-mono font-bold text-emerald-100">{lastUploadResult.series_id}</span>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-emerald-400 hover:text-white p-1 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start justify-between animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-rose-200">Upload Failed</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{uploadError}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(clearUploadError())}
            className="text-rose-400 hover:text-white p-1 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {deleteError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start justify-between animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-rose-200">Deletion Failed</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{deleteError}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(clearDeleteError())}
            className="text-rose-400 hover:text-white p-1 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Step 1 (Select) & Step 2 (Upload) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Target Series */}
          <div className="relative z-30 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-anime-primary/20 text-anime-primary flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Select Series
                </h2>
              </div>
              <span className="text-[11px] text-anime-text/50">Required</span>
            </div>

            {!selectedSeries ? (
              <div ref={dropdownRef} className="relative z-40">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-anime-text/40 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setIsDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsDropdownOpen(false);
                      }
                    }}
                    placeholder="Search by title (e.g. Attack on Titan, Naruto, Loki)..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-anime-text/40 focus:outline-none focus:border-anime-primary/50 focus:ring-1 focus:ring-anime-primary/50 transition"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3.5 w-4 h-4 text-anime-primary animate-spin" />
                  )}
                  {!isSearching && searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 text-anime-text/40 hover:text-white transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown Results */}
                {isDropdownOpen && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-[#14161B] border border-white/15 ring-1 ring-black/50 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 overflow-hidden">
                    <div className="max-h-72 overflow-y-auto scrollbar-thin divide-y divide-white/10 overscroll-contain">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSeries(item)}
                          className="p-3 bg-[#14161B] hover:bg-white/10 flex items-center justify-between gap-3 cursor-pointer transition select-none"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                className="w-9 h-12 object-cover rounded-md bg-black/40 shrink-0 border border-white/10"
                              />
                            ) : (
                              <div className="w-9 h-12 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-anime-text/40">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className="text-[11px] font-mono text-anime-text/50 truncate">
                                  {item.id}
                                </span>
                                {item.year && (
                                  <span className="text-[11px] text-anime-text/40">({item.year})</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">{renderTypeBadge(item.type)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Selected Series Banner */
              <div className="p-4 rounded-xl bg-black/40 border border-anime-primary/30 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5 min-w-0">
                  {selectedSeries.image ? (
                    <img
                      src={selectedSeries.image}
                      alt=""
                      className="w-11 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-anime-text/40" />
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      {renderTypeBadge(selectedSeries.type)}
                      <span className="text-xs text-anime-text/50">Selected</span>
                    </div>
                    <p className="text-sm md:text-base font-bold text-white truncate">
                      {selectedSeries.title}
                    </p>
                    <p className="text-xs font-mono text-anime-primary truncate">
                      ID: {selectedSeries.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearSelectedSeries}
                  className="px-3 py-1.5 text-xs font-semibold text-anime-text/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Step 2: PDF File Ingestion */}
          <form onSubmit={handleUpload} className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-anime-primary/20 text-anime-primary flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Upload PDF Lore Document
                </h2>
              </div>
              <span className="text-[11px] text-anime-text/50">.pdf format</span>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-anime-primary bg-anime-primary/10 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-white/15 bg-black/20 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-anime-primary shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Click to browse or drag and drop your lore PDF
                    </p>
                    <p className="text-xs text-anime-text/50 mt-1">
                      Supports standard PDFs with text, Markdown headings, story timelines, and character lore.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between max-w-md mx-auto p-3 bg-black/40 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-anime-text/50">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 text-anime-text/40 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Ingestion Info Notice */}
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <p>
                <span className="font-bold text-amber-200">Note:</span> Uploading will chunk, embed, and{' '}
                <span className="font-semibold underline">replace all existing chunks</span> for the chosen series.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedSeries || !selectedFile || uploading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer ${
                !selectedSeries || !selectedFile || uploading
                  ? 'bg-white/5 text-anime-text/30 border border-white/5 cursor-not-allowed'
                  : 'bg-anime-primary text-black hover:brightness-110 shadow-lg shadow-anime-primary/20'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing, Chunking & Embedding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedSeries
                      ? `Ingest Lore for "${selectedSeries.title}"`
                      : 'Select a Series to Ingest Lore'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Current Lore Status Panel */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-anime-primary" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Lore Index Status
                </h2>
              </div>
              {statusLoading && <Loader2 className="w-3.5 h-3.5 text-anime-primary animate-spin" />}
            </div>

            {!selectedSeries ? (
              <div className="py-12 text-center text-anime-text/40 space-y-2">
                <Info className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">Select a series to view its current indexed lore status.</p>
              </div>
            ) : statusLoading ? (
              <div className="py-12 text-center text-anime-text/50 space-y-3">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-anime-primary" />
                <p className="text-xs">Checking vector database...</p>
              </div>
            ) : currentStatus ? (
              <div className="space-y-5 animate-fade-in">
                {/* Chunk Count Stat */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-anime-text/50 font-mono">
                    Indexed Chunks
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold font-mono text-white">
                      {currentStatus.chunks_count}
                    </span>
                    <span className="text-xs text-anime-text/50">vector documents</span>
                  </div>
                </div>

                {/* Source Files List */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-anime-text/50 font-mono">
                    Source Files
                  </span>
                  {currentStatus.source_files && currentStatus.source_files.length > 0 ? (
                    <div className="space-y-1.5">
                      {currentStatus.source_files.map((file, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs text-white font-mono flex items-center space-x-2 truncate"
                        >
                          <FileText className="w-3.5 h-3.5 text-anime-primary shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-anime-text/40 italic">No files indexed yet.</p>
                  )}
                </div>

                {/* Delete Section */}
                {currentStatus.chunks_count > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleting}
                      className="w-full py-2.5 px-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete All Indexed Lore</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-anime-text/50 space-y-2">
                <p className="text-xs">{statusError || "No lore status available."}</p>
              </div>
            )}
          </div>

          {/* Quick Guide Card */}
          <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-anime-primary" />
              <span>How Lore RAG Works</span>
            </h3>
            <ul className="text-xs text-anime-text/60 space-y-2 list-disc list-inside leading-relaxed">
              <li>PDFs are extracted, sectioned, and split into overlapping text chunks.</li>
              <li>Batched embeddings are generated using <code className="text-anime-primary font-mono">all-MiniLM-L6-v2</code>.</li>
              <li>Conversational agent queries invoke <code className="text-anime-primary font-mono">query_lore</code> via MongoDB Atlas vector search.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSeries && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-anime-bg border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirm Lore Deletion</h3>
            </div>

            <p className="text-xs md:text-sm text-anime-text/70 leading-relaxed">
              Are you sure you want to delete all indexed lore for{' '}
              <span className="font-bold text-white">"{selectedSeries.title}"</span> (
              <span className="font-mono text-anime-primary">{selectedSeries.id}</span>)?
              This will permanently remove all chunks from the vector database.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-anime-text/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLore;
