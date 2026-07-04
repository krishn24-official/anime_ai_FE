import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, User, Star, ChevronRight, Play } from 'lucide-react';
import { getOptimizedImageUrl } from '../../services/imageHelper';
import { eventService } from '../../services/eventService';

const Schedule: React.FC = () => {
  const today = new Date();
  const fourDaysLater = new Date(today);
  fourDaysLater.setDate(today.getDate() + 3);

  const [dateMode, setDateMode] = useState<'single' | 'range'>('range');
  const [singleDate, setSingleDate] = useState(today.toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(fourDaysLater.toISOString().split('T')[0]);

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

  const formatDisplayDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-8 h-8 text-anime-pink animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold font-outfit text-white tracking-wide">
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

      {/* Results Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-anime-primary/20 border-t-anime-primary rounded-full animate-spin"></div>
        </div>
      ) : scheduleData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scheduleData.map((item) => (
            <div key={item.id} className="premium-card p-5 rounded-2xl flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-anime-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-anime-primary/15 transition-all" />
              
              <div className="flex items-start space-x-4 mb-4">
                <img
                  src={getOptimizedImageUrl(item.image, 150)}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-lg border border-white/10 group-hover:border-anime-primary/40 transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                      item.type === 'birthday' ? 'bg-anime-pink/20 text-anime-pink' : 'bg-anime-primary/20 text-anime-primary'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-anime-primary transition-colors">{item.name}</h4>
                  <p className="text-[11px] text-anime-text truncate">{item.anime}</p>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-3 border border-white/5 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-white">
                  <CalendarIcon className="w-3.5 h-3.5 text-anime-text" />
                  <span>{formatDisplayDate(item.date)}</span>
                </div>
                <p className="text-[11px] text-anime-text line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-anime-border flex flex-col items-center justify-center text-center space-y-4">
          <CalendarIcon className="w-12 h-12 text-anime-text/40" />
          <h3 className="text-lg font-bold text-white font-outfit">No Events Scheduled</h3>
          <p className="text-sm text-anime-text max-w-sm">
            We couldn't find any upcoming birthdays or events for the selected date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default Schedule;
