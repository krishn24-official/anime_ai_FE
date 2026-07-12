import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getOptimizedImageUrl } from '../../services/imageHelper';
import { eventService } from '../../services/eventService';

const FILTERS = ['All', 'Character', 'Anime', 'Movie', 'TV Show'];

const Schedule: React.FC = () => {
  const today = new Date();
  const fourDaysLater = new Date(today);
  fourDaysLater.setDate(today.getDate() + 3);

  const [dateMode, setDateMode] = useState<'single' | 'range'>('range');
  const [singleDate, setSingleDate] = useState(today.toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(fourDaysLater.toISOString().split('T')[0]);
  
  const navigate = useNavigate();
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const start = dateMode === 'single' ? singleDate : startDate;
        const end = dateMode === 'single' ? singleDate : endDate;
        const data = await eventService.fetchScheduleRange(start, end);
        setScheduleData(data.sort((a, b) => a.date.localeCompare(b.date)));
      } catch (err) {
        console.error('Failed to load schedule', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [dateMode, singleDate, startDate, endDate]);

  const filteredData = scheduleData.filter((item) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Character') return item.type === 'birthday';
    if (activeFilter === 'Anime') return item.anime === 'Anime';
    if (activeFilter === 'Movie') return item.anime === 'Movie';
    if (activeFilter === 'TV Show') return item.anime === 'TV Series';
    return true;
  });

  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-8 h-8 text-anime-pink animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold font-fraunces text-white tracking-wide">
            Upcoming Schedule
          </h2>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex bg-black/40 rounded-xl p-1">
            <button
              onClick={() => setDateMode('single')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dateMode === 'single' ? 'bg-anime-primary text-black' : 'text-anime-text hover:text-white'
              }`}
            >
              Single Date
            </button>
            <button
              onClick={() => setDateMode('range')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                dateMode === 'range' ? 'bg-anime-primary text-black' : 'text-anime-text hover:text-white'
              }`}
            >
              Date Range
            </button>
          </div>

          <div className="flex items-center gap-2">
            {dateMode === 'single' ? (
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-anime-primary [color-scheme:dark]"
              />
            ) : (
              <>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-anime-primary [color-scheme:dark]"
                />
                <span className="text-anime-text text-xs">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-anime-primary [color-scheme:dark]"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
              activeFilter === f
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-anime-primary/20 border-t-anime-primary rounded-full animate-spin"></div>
        </div>
      ) : Object.keys(groupedData).length > 0 ? (
        <div className="space-y-12">
          {Object.entries(groupedData).map(([dateStr, items]) => {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayOfMonth = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

            return (
              <div key={dateStr} className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Date Block */}
                <div className="w-full md:w-20 shrink-0">
                  <div className="bg-black/40 rounded-xl p-3 border border-white/10 text-center flex flex-row md:flex-col items-center justify-center gap-2 md:gap-0 md:sticky md:top-24">
                    <span className="text-[10px] font-bold text-anime-text tracking-widest uppercase">{dayOfWeek}</span>
                    <span className="text-2xl md:text-3xl font-bold text-white my-0 md:my-1">{dayOfMonth}</span>
                    <span className="text-[10px] font-bold text-anime-text tracking-widest uppercase">{month}</span>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="group cursor-pointer"
                      onClick={() => {
                        if (item.type === 'birthday') {
                          navigate('/characters', { state: { searchQuery: item.name } });
                        } else if (item.type !== 'event') {
                          navigate('/content', { state: { searchQuery: item.name } });
                        }
                      }}
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl mb-3 shadow-lg border border-white/5 group-hover:border-anime-primary/30 transition-colors">
                        <img
                          src={getOptimizedImageUrl(item.image, 300)}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Status Badge overlay on hover or top left */}
                        <div className="absolute top-2 left-2 flex gap-1">
                            {(() => {
                                let bgClass = 'bg-black/60 text-white backdrop-blur-md';
                                let label = item.type;
                                
                                if (item.type === 'birthday') {
                                    bgClass = 'bg-anime-pink/80 text-white backdrop-blur-md';
                                    label = 'Birthday';
                                } else if (item.type === 'release_start') {
                                    bgClass = 'bg-emerald-500/80 text-white backdrop-blur-md';
                                    label = 'Release';
                                } else if (item.type === 'release_end') {
                                    bgClass = 'bg-emerald-500/80 text-white backdrop-blur-md';
                                    label = 'Finale';
                                } else if (item.type === 'announced_start') {
                                    bgClass = 'bg-purple-500/80 text-white backdrop-blur-md';
                                    label = 'Announced';
                                } else if (item.type === 'announced_end') {
                                    bgClass = 'bg-purple-500/80 text-white backdrop-blur-md';
                                    label = 'Announced End';
                                } else if (item.type === 'event') {
                                    bgClass = 'bg-blue-500/80 text-white backdrop-blur-md';
                                    label = 'Event';
                                }

                                return (
                                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-white/20 ${bgClass}`}>
                                    {label}
                                    </span>
                                );
                            })()}
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-anime-primary transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-anime-border flex flex-col items-center justify-center text-center space-y-4 mt-8">
          <CalendarIcon className="w-12 h-12 text-anime-text/40" />
          <h3 className="text-lg font-bold text-white font-fraunces">No Events Scheduled</h3>
          <p className="text-sm text-anime-text max-w-sm">
            We couldn't find any {activeFilter !== 'All' ? activeFilter : 'upcoming'} items for the selected date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default Schedule;
