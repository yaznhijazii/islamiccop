import { useState, useEffect } from 'react';
import { Youtube, Play, X, Tv2, Radio, Headphones, Volume2 } from 'lucide-react';

export function PodcastCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // ==================================================================
  // للتبديل بين فيديو وصوت، غيّر قيمة type:
  // - للفيديو: type: 'video'
  // - للصوت: type: 'audio'
  // ==================================================================
  const podcast = {
    type: 'video' as 'video' | 'audio', // 👈 غيّر هنا: 'video' أو 'audio'
    
    // إذا type: 'video' - حط رابط اليوتيوب هنا:
    videoId: 'T9S2YCQD-20',
    
    // إذا type: 'audio' - حط رابط الملف الصوتي هنا:
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    
    title: 'أسرار الخطوبة والزواج الناجح مع د. دلال قطيشات | بودكاست وعي',
    duration: 100,
  };

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    const username = currentUser ? JSON.parse(currentUser).username : 'guest';
    
    // Get current week starting from Saturday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const daysToSaturday = dayOfWeek === 6 ? 0 : (dayOfWeek + 1); // Days since last Saturday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysToSaturday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekKey = `podcast-progress-${username}-${weekStart.toISOString().split('T')[0]}`;
    const saved = localStorage.getItem(weekKey);
    if (saved) {
      setProgress(parseInt(saved));
    }
  }, []);

  const saveProgress = (value: number) => {
    setProgress(value);
    const currentUser = localStorage.getItem('currentUser');
    const username = currentUser ? JSON.parse(currentUser).username : 'guest';
    
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToSaturday = dayOfWeek === 6 ? 0 : (dayOfWeek + 1);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - daysToSaturday);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekKey = `podcast-progress-${username}-${weekStart.toISOString().split('T')[0]}`;
    localStorage.setItem(weekKey, value.toString());
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20">
      {/* TV Screen Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
      }}></div>

      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-pink-600 p-2 rounded-lg">
              <Tv2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              بودكاست الأسبوع
            </h3>
            <p className="text-xs text-purple-300">استمتع بوقتك</p>
          </div>
          {progress === 100 && (
            <div className="bg-green-500/20 border border-green-500/50 px-2 py-1 rounded-lg">
              <span className="text-green-300 text-xs font-bold">✓ مكتمل</span>
            </div>
          )}
        </div>

        {!isPlaying ? (
          <button
            onClick={() => setIsPlaying(true)}
            className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 group hover:border-red-500/50 transition-all"
          >
            {podcast.type === 'video' ? (
              <>
                {/* Thumbnail with gradient overlay */}
                <img
                  src={`https://img.youtube.com/vi/${podcast.videoId}/maxresdefault.jpg`}
                  alt={podcast.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-500 text-white p-3 rounded-full group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-6 h-6 mr-1" fill="currentColor" />
                  </div>
                </div>
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-xs font-semibold line-clamp-2">{podcast.title}</p>
                </div>
              </>
            ) : (
              <>
                {/* Audio thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white blur-2xl opacity-50 animate-pulse"></div>
                    <Headphones className="relative w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm mb-1">بودكاست صوتي</p>
                    <p className="text-white/80 text-xs line-clamp-2">{podcast.title}</p>
                  </div>
                  <div className="bg-white text-purple-600 p-3 rounded-full group-hover:scale-110 transition-transform shadow-lg">
                    <Volume2 className="w-6 h-6" />
                  </div>
                </div>
              </>
            )}
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute -top-2 -left-2 z-10 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            
            {podcast.type === 'video' ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${podcast.videoId}?autoplay=1`}
                  title={podcast.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            ) : (
              <div className="relative w-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-6">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <Headphones className="w-12 h-12 text-white animate-pulse" />
                  <p className="text-white text-sm font-semibold text-center">{podcast.title}</p>
                </div>
                <audio 
                  controls 
                  autoPlay
                  className="w-full"
                  src={podcast.audioUrl}
                >
                  متصفحك لا يدعم تشغيل الصوت.
                </audio>
              </div>
            )}
          </div>
        )}

        {!isPlaying && (
          <>
            {/* Channel Info */}
            <div className="mt-3 flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2">
                {podcast.type === 'video' ? (
                  <Youtube className="w-4 h-4 text-red-400" />
                ) : (
                  <Headphones className="w-4 h-4 text-purple-400" />
                )}
                <span className="text-purple-200 text-xs">بودكاست وعي</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                podcast.type === 'video' 
                  ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}>
                {podcast.type === 'video' ? 'YouTube' : 'Audio'}
              </span>
            </div>

            {/* Progress Tracker - Cinematic Design */}
            <div className="mt-4 p-3 bg-gradient-to-br from-slate-800/50 to-purple-900/30 rounded-lg border border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-purple-200 text-sm font-semibold">مشاهدة الحلقة</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${progress > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-white font-bold text-lg">{progress}%</span>
                </div>
              </div>
              
              {/* Cinematic Progress Bar */}
              <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden mb-3 border border-slate-600/50">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                </div>
                {progress > 0 && (
                  <div 
                    className="absolute top-0 h-full w-1 bg-white/50 blur-sm transition-all duration-500"
                    style={{ left: `${progress}%` }}
                  ></div>
                )}
              </div>

              {/* Progress Controls - TV Remote Style */}
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => saveProgress(100)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    progress === 100 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/50' 
                      : 'bg-green-900/30 text-green-200 hover:bg-green-800/40 border border-green-700/50'
                  }`}
                >
                  ✓
                </button>
                <button
                  onClick={() => saveProgress(75)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    progress === 75 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'bg-slate-700/50 text-purple-200 hover:bg-slate-600/50 border border-slate-600/50'
                  }`}
                >
                  75%
                </button>
                <button
                  onClick={() => saveProgress(50)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    progress === 50 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'bg-slate-700/50 text-purple-200 hover:bg-slate-600/50 border border-slate-600/50'
                  }`}
                >
                  50%
                </button>
                <button
                  onClick={() => saveProgress(25)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    progress === 25 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'bg-slate-700/50 text-purple-200 hover:bg-slate-600/50 border border-slate-600/50'
                  }`}
                >
                  25%
                </button>
                <button
                  onClick={() => saveProgress(0)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                    progress === 0 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'bg-slate-700/50 text-purple-200 hover:bg-slate-600/50 border border-slate-600/50'
                  }`}
                >
                  بداية
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}