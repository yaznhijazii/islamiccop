import { useState, useEffect } from 'react';
import { BarChart, Heart, X, TrendingUp, Award, CheckCircle2 } from 'lucide-react';

interface UserData {
  password: string;
  name: string;
  partnerCode: string;
  partnerId?: string;
}

interface WeeklyReportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProgress {
  name: string;
  prayers: number;  // out of 35 (5 prayers × 7 days)
  quran: number;   // pages read
  athkar: number;  // days completed
  podcast: number; // percentage
}

export function WeeklyReport({ isOpen, onClose }: WeeklyReportProps) {
  const [myProgress, setMyProgress] = useState<UserProgress | null>(null);
  const [partnerProgress, setPartnerProgress] = useState<UserProgress | null>(null);
  const [hasPartner, setHasPartner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadWeeklyData();
    }
  }, [isOpen]);

  const loadWeeklyData = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const { username } = JSON.parse(currentUser);
    const usersData = localStorage.getItem('appUsers');
    const users: Record<string, UserData> = usersData ? JSON.parse(usersData) : {};
    
    const userData = users[username];
    if (!userData) return;

    // Load my progress
    const myProgressData = calculateUserProgress(username, userData.name);
    setMyProgress(myProgressData);

    // Check for partner
    if (userData.partnerId) {
      const partner = users[userData.partnerId];
      if (partner) {
        setHasPartner(true);
        const partnerProgressData = calculateUserProgress(userData.partnerId, partner.name);
        setPartnerProgress(partnerProgressData);
      }
    } else {
      setHasPartner(false);
      setPartnerProgress(null);
    }
  };

  const calculateUserProgress = (username: string, name: string): UserProgress => {
    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toDateString());
    }

    let prayers = 0;
    let quranPages = 0;
    let athkarDays = 0;

    // Count prayers
    last7Days.forEach(day => {
      ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(prayer => {
        const key = `prayer-${prayer}-${username}-${day}`;
        if (localStorage.getItem(key) === 'true') {
          prayers++;
        }
      });
    });

    // Count Quran pages
    last7Days.forEach(day => {
      const baqarahKey = `quran-baqarah-${username}-${day}`;
      const mulkKey = `quran-mulk-${username}-${day}`;
      const kahfKey = `quran-kahf-${username}-${day}`;
      
      const baqarahData = localStorage.getItem(baqarahKey);
      const mulkData = localStorage.getItem(mulkKey);
      const kahfData = localStorage.getItem(kahfKey);
      
      if (baqarahData) quranPages += JSON.parse(baqarahData).pagesRead || 0;
      if (mulkData === 'true') quranPages += 2; // Mulk is ~2 pages
      if (kahfData === 'true') quranPages += 6; // Kahf is ~6 pages
    });

    // Count Athkar days
    last7Days.forEach(day => {
      const morningKey = `athkar-morning-${username}-${day}`;
      const eveningKey = `athkar-evening-${username}-${day}`;
      
      if (localStorage.getItem(morningKey) === 'true' && localStorage.getItem(eveningKey) === 'true') {
        athkarDays++;
      }
    });

    // Get podcast progress
    const podcastKey = `podcast-${username}`;
    const podcastData = localStorage.getItem(podcastKey);
    const podcast = podcastData ? JSON.parse(podcastData).progress || 0 : 0;

    return {
      name,
      prayers,
      quran: quranPages,
      athkar: athkarDays,
      podcast
    };
  };

  const getPercentage = (value: number, max: number) => {
    return Math.round((value / max) * 100);
  };

  const getComparisonEmoji = (myValue: number, partnerValue: number) => {
    if (myValue > partnerValue) return '🏆';
    if (myValue < partnerValue) return '💪';
    return '🤝';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full my-8 border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <BarChart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-xl">التقرير الأسبوعي</h2>
                <p className="text-purple-100 text-sm">آخر 7 أيام</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          {myProgress && (
            <>
              {/* Header with names */}
              <div className="grid grid-cols-2 gap-4">
                {/* My card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {myProgress.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-blue-900">{myProgress.name}</p>
                      <p className="text-xs text-blue-700">أنت</p>
                    </div>
                  </div>
                </div>

                {/* Partner card */}
                {hasPartner && partnerProgress ? (
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border-2 border-pink-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                        {partnerProgress.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-pink-900">{partnerProgress.name}</p>
                        <p className="text-xs text-pink-700 flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          شريكك
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 flex items-center justify-center">
                    <p className="text-sm text-gray-600 text-center">
                      لم يتم الربط مع شريك بعد
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Comparison */}
              <div className="space-y-4">
                {/* Prayers */}
                <div className="bg-white rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      🕌 الصلوات
                    </h3>
                    <span className="text-xs text-muted-foreground">من أصل 35 صلاة</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{myProgress.name}</span>
                        <span className="font-bold text-blue-600">
                          {myProgress.prayers} {hasPartner && partnerProgress && getComparisonEmoji(myProgress.prayers, partnerProgress.prayers)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${getPercentage(myProgress.prayers, 35)}%` }}
                        ></div>
                      </div>
                    </div>
                    {hasPartner && partnerProgress && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{partnerProgress.name}</span>
                          <span className="font-bold text-pink-600">
                            {partnerProgress.prayers} {getComparisonEmoji(partnerProgress.prayers, myProgress.prayers)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-pink-500 transition-all"
                            style={{ width: `${getPercentage(partnerProgress.prayers, 35)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quran */}
                <div className="bg-white rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      📖 القرآن الكريم
                    </h3>
                    <span className="text-xs text-muted-foreground">عدد الصفحات</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{myProgress.name}</span>
                        <span className="font-bold text-blue-600">
                          {myProgress.quran} {hasPartner && partnerProgress && getComparisonEmoji(myProgress.quran, partnerProgress.quran)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${Math.min(getPercentage(myProgress.quran, 100), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    {hasPartner && partnerProgress && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{partnerProgress.name}</span>
                          <span className="font-bold text-pink-600">
                            {partnerProgress.quran} {getComparisonEmoji(partnerProgress.quran, myProgress.quran)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-pink-500 transition-all"
                            style={{ width: `${Math.min(getPercentage(partnerProgress.quran, 100), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Athkar */}
                <div className="bg-white rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      📿 الأذكار
                    </h3>
                    <span className="text-xs text-muted-foreground">من أصل 7 أيام</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{myProgress.name}</span>
                        <span className="font-bold text-blue-600">
                          {myProgress.athkar} {hasPartner && partnerProgress && getComparisonEmoji(myProgress.athkar, partnerProgress.athkar)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${getPercentage(myProgress.athkar, 7)}%` }}
                        ></div>
                      </div>
                    </div>
                    {hasPartner && partnerProgress && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{partnerProgress.name}</span>
                          <span className="font-bold text-pink-600">
                            {partnerProgress.athkar} {getComparisonEmoji(partnerProgress.athkar, myProgress.athkar)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-pink-500 transition-all"
                            style={{ width: `${getPercentage(partnerProgress.athkar, 7)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Podcast */}
                <div className="bg-white rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      🎧 البودكاست الأسبوعي
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{myProgress.name}</span>
                        <span className="font-bold text-blue-600">
                          {myProgress.podcast}% {hasPartner && partnerProgress && getComparisonEmoji(myProgress.podcast, partnerProgress.podcast)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${myProgress.podcast}%` }}
                        ></div>
                      </div>
                    </div>
                    {hasPartner && partnerProgress && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{partnerProgress.name}</span>
                          <span className="font-bold text-pink-600">
                            {partnerProgress.podcast}% {getComparisonEmoji(partnerProgress.podcast, myProgress.podcast)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-pink-500 transition-all"
                            style={{ width: `${partnerProgress.podcast}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Motivation */}
              {hasPartner && partnerProgress && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-500 p-2 rounded-full">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 mb-1">تنافسوا في الخيرات!</h4>
                      <p className="text-sm text-amber-800">
                        ما أجمل أن تشجعوا بعضكم في الطاعات 💚
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
