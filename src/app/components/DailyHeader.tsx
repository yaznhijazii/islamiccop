import { useState, useEffect } from 'react';
import { Heart, Calendar, ArrowLeft, Sparkles } from 'lucide-react';
import { useTimeOfDay, timeOfDayConfig } from '../hooks/useTimeOfDay';
import logoImage from 'figma:asset/b0d46a9e801636886dfa8a57dae2d9466fe10738.png';

interface DailyHeaderProps {
  userName?: string;
}

export function DailyHeader({ userName }: DailyHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [stats, setStats] = useState({
    todayProgress: 0,
    totalCompleted: 0,
    totalTasks: 0,
  });
  const timeOfDay = useTimeOfDay();
  const timeConfig = timeOfDayConfig[timeOfDay];

  // Extract first name only
  const firstName = userName ? userName.split(' ')[0] : '';
  const greetingText = `السلام عليكم ورحمة الله ${firstName ? `يا ${firstName}` : ''}`;

  // Typewriter effect
  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    const typeInterval = setInterval(() => {
      if (currentIndex < greetingText.length) {
        setDisplayedText(greetingText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typeInterval);
      }
    }, 50); // Typing speed

    return () => clearInterval(typeInterval);
  }, [greetingText]);

  // Calculate stats
  useEffect(() => {
    const updateStats = () => {
      const now = new Date();
      const today = now.toDateString();
      const currentUser = localStorage.getItem('currentUser');
      const username = currentUser ? JSON.parse(currentUser).username : 'guest';
      
      // Get prayers
      const prayers = localStorage.getItem(`prayers-${username}-${today}`);
      const prayersCompleted = prayers ? Object.values(JSON.parse(prayers)).filter(Boolean).length : 0;
      
      // Get athkar
      const morningAthkar = localStorage.getItem(`athkar-morning-${username}-${today}`);
      const eveningAthkar = localStorage.getItem(`athkar-evening-${username}-${today}`);
      const athkarCompleted = 
        (morningAthkar && JSON.parse(morningAthkar) ? 1 : 0) +
        (eveningAthkar && JSON.parse(eveningAthkar) ? 1 : 0);
      
      // Get Quran
      const quran = localStorage.getItem(`quran-${username}-${today}`);
      const quranCompleted = quran ? Object.values(JSON.parse(quran)).filter(Boolean).length : 0;
      
      const total = prayersCompleted + athkarCompleted + quranCompleted;
      const maxPossible = 5 + 2 + 2; // 5 prayers + 2 athkar + 2 quran tasks (baqarah + mulk)
      const progress = Math.round((total / maxPossible) * 100);

      setStats({
        todayProgress: progress,
        totalCompleted: total,
        totalTasks: maxPossible,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds
    window.addEventListener('storage', updateStats);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateStats);
    };
  }, []);

  // Fetch prayer times from API
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        // Format today's date as DD-MM-YYYY
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateString = `${day}-${month}-${year}`;
        
        const url = `https://api.aladhan.com/v1/timings/${dateString}?latitude=31.9454&longitude=35.9284&method=2`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.data && data.data.timings) {
          setPrayerTimes(data.data.timings);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        // Fallback to default times
        setPrayerTimes({
          Fajr: '05:15',
          Dhuhr: '12:30',
          Asr: '15:45',
          Maghrib: '18:20',
          Isha: '19:45',
        });
      }
    };

    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;

    const timeStringToMinutes = (timeString: string): number => {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const updateCurrentTask = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const today = now.toDateString();
      const currentUser = localStorage.getItem('currentUser');
      const username = currentUser ? JSON.parse(currentUser).username : 'guest';
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentMinutes = hour * 60 + minute;
      
      const prayers = localStorage.getItem(`prayers-${username}-${today}`);
      const morningAthkar = localStorage.getItem(`athkar-morning-${username}-${today}`);
      const eveningAthkar = localStorage.getItem(`athkar-evening-${username}-${today}`);
      const quran = localStorage.getItem(`quran-${username}-${today}`);
      
      const fajrMinutes = timeStringToMinutes(prayerTimes.Fajr);
      const dhuhrMinutes = timeStringToMinutes(prayerTimes.Dhuhr);
      const asrMinutes = timeStringToMinutes(prayerTimes.Asr);
      const maghribMinutes = timeStringToMinutes(prayerTimes.Maghrib);
      const ishaMinutes = timeStringToMinutes(prayerTimes.Isha);
      
      let current = null;
      
      // Priority 1: Prayers (tight time windows)
      if (currentMinutes >= fajrMinutes && currentMinutes < fajrMinutes + 75) {
        const prayersData = prayers ? JSON.parse(prayers) : {};
        if (!prayersData.fajr) current = 'صلاة الفجر';
      } else if (currentMinutes >= dhuhrMinutes && currentMinutes < dhuhrMinutes + 90) {
        const prayersData = prayers ? JSON.parse(prayers) : {};
        if (!prayersData.dhuhr) current = 'صلاة الظهر';
      } else if (currentMinutes >= asrMinutes && currentMinutes < asrMinutes + 90) {
        const prayersData = prayers ? JSON.parse(prayers) : {};
        if (!prayersData.asr) current = 'صلاة العصر';
      } else if (currentMinutes >= maghribMinutes && currentMinutes < maghribMinutes + 40) {
        const prayersData = prayers ? JSON.parse(prayers) : {};
        if (!prayersData.maghrib) current = 'صلاة المغرب';
      } else if (currentMinutes >= ishaMinutes && currentMinutes < ishaMinutes + 60) {
        const prayersData = prayers ? JSON.parse(prayers) : {};
        if (!prayersData.isha) current = 'صلاة العشاء';
      }
      
      // Priority 2: Athkar (if no prayer)
      if (!current && currentMinutes >= 6 * 60 && currentMinutes < 12 * 60) {
        if (!morningAthkar || !JSON.parse(morningAthkar)) current = 'أذكار الصباح';
      } else if (!current && currentMinutes >= asrMinutes + 60 && currentMinutes < maghribMinutes) {
        // Evening Athkar after Asr by 1 hour until Maghrib
        if (!eveningAthkar || !JSON.parse(eveningAthkar)) current = 'أذكار المساء';
      }
      
      // Priority 3: Quran (if no prayer/athkar)
      if (!current && currentMinutes >= 8 * 60 && currentMinutes < 12 * 60) {
        const quranData = quran ? JSON.parse(quran) : {};
        if (!quranData.baqarah) current = 'سورة البقرة';
      } else if (!current && currentMinutes >= 20 * 60 && currentMinutes < 23 * 60 + 30) {
        const quranData = quran ? JSON.parse(quran) : {};
        if (!quranData.mulk) current = 'سورة الملك';
      }
      
      setCurrentTask(current);
    };

    updateCurrentTask();
    const timer = setInterval(updateCurrentTask, 60000); // Update every minute
    
    // Listen for storage changes
    window.addEventListener('storage', updateCurrentTask);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', updateCurrentTask);
    };
  }, [prayerTimes]);

  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayName = arabicDays[currentTime.getDay()];
  const day = currentTime.getDate();
  const month = arabicMonths[currentTime.getMonth()];
  const year = currentTime.getFullYear();

  return (
    <div className={`relative bg-gradient-to-br ${timeConfig.headerGradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg text-white transition-all duration-1000 overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl sm:text-3xl animate-bounce">{timeConfig.icon}</span>
              <span className="text-xs sm:text-sm opacity-90">{timeConfig.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-1 sm:mb-2 min-h-[2rem]">
              {displayedText}
              {!isTypingComplete && <span className="animate-pulse">|</span>}
            </h1>
            <p className="text-white/90 text-sm sm:text-base md:text-lg mb-3">
              {timeConfig.message}
            </p>
            
            {/* Progress Inline */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/25">
                <span className="text-xs opacity-90">التقدم:</span>
                <span className="text-sm font-bold">{stats.todayProgress}%</span>
                <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${stats.todayProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/25">
                <span className="text-xs opacity-90">مكتمل:</span>
                <span className="text-sm font-bold">{stats.totalCompleted}/{stats.totalTasks}</span>
              </div>
            </div>
            
            {currentTask && (
              <div className="mt-3 inline-flex items-center gap-2 bg-amber-400/20 backdrop-blur-sm px-3 py-2 rounded-full border border-amber-300/40 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span className="text-sm font-semibold">الآن:</span>
                <span className="text-sm">{currentTask}</span>
                <ArrowLeft className="w-3 h-3" />
              </div>
            )}
          </div>
          
          <div className="w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm opacity-90">التاريخ</span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold">{dayName}</p>
              <p className="text-xs sm:text-sm opacity-90">{day} {month} {year}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
