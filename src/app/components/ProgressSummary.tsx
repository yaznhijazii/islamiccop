import { useState, useEffect } from 'react';
import { TrendingUp, Award, Flame } from 'lucide-react';

export function ProgressSummary() {
  const [stats, setStats] = useState({
    todayProgress: 0,
    weekStreak: 0,
    totalCompleted: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      // Calculate today's progress from localStorage
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
      const maxPossible = 5 + 2 + 3; // 5 prayers + 2 athkar + 3 quran tasks (max)
      const progress = Math.round((total / maxPossible) * 100);

      setStats({
        todayProgress: progress,
        weekStreak: 7, // This would be calculated from actual streak data
        totalCompleted: total,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 60000); // Update every minute

    // Listen for storage changes
    const handleStorageChange = () => {
      updateStats();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* Today Progress */}
      <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-[2px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
        <div className="relative bg-background rounded-[14px] p-4 sm:p-5 h-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 sm:p-2 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">التقدم اليومي</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {stats.todayProgress}
            </p>
            <span className="text-lg text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">من المهام اليومية</p>
          
          {/* Mini Progress Bar */}
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${stats.todayProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-[2px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
        <div className="relative bg-background rounded-[14px] p-4 sm:p-5 h-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-1.5 sm:p-2 rounded-lg">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">سلسلة الأيام</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {stats.weekStreak}
            </p>
            <span className="text-lg text-muted-foreground">🔥</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">أيام متتالية</p>
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-[2px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
        <div className="relative bg-background rounded-[14px] p-4 sm:p-5 h-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 sm:p-2 rounded-lg">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">المهام المكتملة</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {stats.totalCompleted}
            </p>
            <span className="text-lg text-muted-foreground">✓</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">اليوم</p>
        </div>
      </div>
    </div>
  );
}