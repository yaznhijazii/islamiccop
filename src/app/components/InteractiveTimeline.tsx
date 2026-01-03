import { useState, useEffect, useRef } from 'react';
import { Clock, Check, Circle, Sunrise, Sun, Cloud, Sunset, Moon, BookOpen, Sparkles, ChevronDown, ChevronUp, BookMarked } from 'lucide-react';

interface TimelineTask {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: any;
  type: 'prayer' | 'athkar' | 'quran';
  storageKey: string;
  storageField?: string;
  isActive: boolean;
  isPast: boolean;
  timeInMinutes: number;
  isCompleted: boolean;
}

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export function InteractiveTimeline() {
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Get username
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUsername(userData.username);
    }
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
    if (prayerTimes) {
      updateTasks();
    }
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (prayerTimes) {
        updateTasks();
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Auto-scroll to active task
  useEffect(() => {
    if (tasks.length > 0 && scrollContainerRef.current) {
      const activeTaskIndex = tasks.findIndex(task => task.isActive && !completionStatus[task.id]);
      if (activeTaskIndex !== -1) {
        const taskElements = scrollContainerRef.current.querySelectorAll('button');
        const activeElement = taskElements[activeTaskIndex];
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [tasks, completionStatus]);

  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const updateTasks = () => {
    if (!prayerTimes) return;

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentMinutes = hour * 60 + minute;
    const today = now.toDateString();
    const username = currentUsername || 'guest';
    const dayOfWeek = now.getDay();

    const fajrMinutes = timeStringToMinutes(prayerTimes.Fajr);
    const dhuhrMinutes = timeStringToMinutes(prayerTimes.Dhuhr);
    const asrMinutes = timeStringToMinutes(prayerTimes.Asr);
    const maghribMinutes = timeStringToMinutes(prayerTimes.Maghrib);
    const ishaMinutes = timeStringToMinutes(prayerTimes.Isha);

    const allTasks: TimelineTask[] = [
      // Fajr
      {
        id: 'fajr',
        time: prayerTimes.Fajr,
        title: 'صلاة الفجر',
        description: 'وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا',
        icon: Sunrise,
        type: 'prayer',
        storageKey: `prayers-${username}-${today}`,
        storageField: 'fajr',
        timeInMinutes: fajrMinutes,
        isActive: currentMinutes >= fajrMinutes && currentMinutes < fajrMinutes + 75,
        isPast: currentMinutes >= fajrMinutes + 75,
        isCompleted: false,
      },
      // Morning Athkar
      {
        id: 'athkar-morning',
        time: '06:00',
        title: 'أذكار الصباح',
        description: 'احمِ نفسك بذكر الله في الصباح',
        icon: Sun,
        type: 'athkar',
        storageKey: `athkar-morning-${username}-${today}`,
        timeInMinutes: 6 * 60,
        isActive: currentMinutes >= 6 * 60 && currentMinutes < 12 * 60,
        isPast: currentMinutes >= 12 * 60,
        isCompleted: false,
      },
      // Baqarah
      {
        id: 'baqarah',
        time: '08:00',
        title: 'سورة البقرة - 7 صفحات',
        description: 'اقرأ من البقرة يومياً للحماية من الشيطان',
        icon: BookOpen,
        type: 'quran',
        storageKey: `quran-${username}-${today}`,
        storageField: 'baqarah',
        timeInMinutes: 8 * 60,
        isActive: currentMinutes >= 8 * 60 && currentMinutes < 22 * 60,
        isPast: currentMinutes >= 22 * 60,
        isCompleted: false,
      },
      // Dhuhr
      {
        id: 'dhuhr',
        time: prayerTimes.Dhuhr,
        title: 'صلاة الظهر',
        description: 'الصلاة الوسطى - حافظ عليها',
        icon: Sun,
        type: 'prayer',
        storageKey: `prayers-${username}-${today}`,
        storageField: 'dhuhr',
        timeInMinutes: dhuhrMinutes,
        isActive: currentMinutes >= dhuhrMinutes && currentMinutes < dhuhrMinutes + 90,
        isPast: currentMinutes >= dhuhrMinutes + 90,
        isCompleted: false,
      },
      // Evening Athkar
      {
        id: 'athkar-evening',
        time: '15:00',
        title: 'أذكار المساء',
        description: 'احمِ نفسك بذكر الله في المساء',
        icon: Cloud,
        type: 'athkar',
        storageKey: `athkar-evening-${username}-${today}`,
        timeInMinutes: 15 * 60,
        isActive: currentMinutes >= 15 * 60 && currentMinutes < 19 * 60,
        isPast: currentMinutes >= 19 * 60,
        isCompleted: false,
      },
      // Asr
      {
        id: 'asr',
        time: prayerTimes.Asr,
        title: 'صلاة العصر',
        description: 'من فاتته العصر فكأنما وُتِر أهله وماله',
        icon: Cloud,
        type: 'prayer',
        storageKey: `prayers-${username}-${today}`,
        storageField: 'asr',
        timeInMinutes: asrMinutes,
        isActive: currentMinutes >= asrMinutes && currentMinutes < asrMinutes + 90,
        isPast: currentMinutes >= asrMinutes + 90,
        isCompleted: false,
      },
      // Maghrib
      {
        id: 'maghrib',
        time: prayerTimes.Maghrib,
        title: 'صلاة المغرب',
        description: 'صلاة الغروب - لا تفوتك',
        icon: Sunset,
        type: 'prayer',
        storageKey: `prayers-${username}-${today}`,
        storageField: 'maghrib',
        timeInMinutes: maghribMinutes,
        isActive: currentMinutes >= maghribMinutes && currentMinutes < maghribMinutes + 40,
        isPast: currentMinutes >= maghribMinutes + 40,
        isCompleted: false,
      },
      // Isha
      {
        id: 'isha',
        time: prayerTimes.Isha,
        title: 'صلاة العشاء',
        description: 'آخر صلوات اليوم',
        icon: Moon,
        type: 'prayer',
        storageKey: `prayers-${username}-${today}`,
        storageField: 'isha',
        timeInMinutes: ishaMinutes,
        isActive: currentMinutes >= ishaMinutes && currentMinutes < ishaMinutes + 60,
        isPast: currentMinutes >= ishaMinutes + 60,
        isCompleted: false,
      },
      // Mulk
      {
        id: 'mulk',
        time: '20:00',
        title: 'سورة الملك',
        description: 'قبل النوم - تنجيك من عذاب القبر',
        icon: BookOpen,
        type: 'quran',
        storageKey: `quran-${username}-${today}`,
        storageField: 'mulk',
        timeInMinutes: 20 * 60,
        isActive: currentMinutes >= 20 * 60,
        isPast: false,
        isCompleted: false,
      },
    ];

    // Add Kahf on Friday
    if (dayOfWeek === 5) {
      allTasks.push({
        id: 'kahf',
        time: '10:00',
        title: 'سورة الكهف - يوم الجمعة',
        description: 'نور من الجمعة للجمعة',
        icon: BookOpen,
        type: 'quran',
        storageKey: `quran-${username}-${today}`,
        storageField: 'kahf',
        timeInMinutes: 10 * 60,
        isActive: true,
        isPast: false,
        isCompleted: false,
      });
    }

    // Sort by time
    allTasks.sort((a, b) => a.timeInMinutes - b.timeInMinutes);

    setTasks(allTasks);

    // Load completion status
    const status: Record<string, boolean> = {};
    allTasks.forEach(task => {
      // For Quran tasks, check both old format and new progress format
      if (task.type === 'quran' && task.storageField) {
        // Check new progress format
        const progressKey = `quran-progress-${task.storageField}-${username}-${today}`;
        const progressData = localStorage.getItem(progressKey);
        if (progressData) {
          const parsed = JSON.parse(progressData);
          status[task.id] = parsed.completed === true;
        } else {
          // Fall back to old format
          const oldData = localStorage.getItem(task.storageKey);
          if (oldData) {
            const parsed = JSON.parse(oldData);
            status[task.id] = parsed[task.storageField] === true;
          } else {
            status[task.id] = false;
          }
        }
      } else {
        // Regular tasks (prayers and athkar)
        const data = localStorage.getItem(task.storageKey);
        if (data) {
          const parsed = JSON.parse(data);
          if (task.storageField) {
            status[task.id] = parsed[task.storageField] === true;
          } else {
            status[task.id] = parsed === true || parsed === 'true';
          }
        } else {
          status[task.id] = false;
        }
      }
    });
    setCompletionStatus(status);
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = !completionStatus[taskId];
    const data = localStorage.getItem(task.storageKey);
    let parsed = data ? JSON.parse(data) : {};

    if (task.storageField) {
      parsed[task.storageField] = newStatus;
    } else {
      parsed = newStatus;
    }

    localStorage.setItem(task.storageKey, JSON.stringify(parsed));
    setCompletionStatus({ ...completionStatus, [taskId]: newStatus });

    // Trigger update
    window.dispatchEvent(new Event('storage'));
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'prayer':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'athkar':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'quran':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'prayer':
        return 'صلاة';
      case 'athkar':
        return 'أذكار';
      case 'quran':
        return 'قرآن';
      default:
        return '';
    }
  };

  if (!prayerTimes) {
    return (
      <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-center">
          <div className="text-muted-foreground">جارٍ تحميل مواقيت الصلاة...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-border/50 shadow-lg sticky top-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-foreground text-base sm:text-lg">جدول اليوم</h2>
        </div>
        <div className="text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg font-medium">
          {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="space-y-2.5 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-1" ref={scrollContainerRef}>{tasks.map((task) => {
          const Icon = task.icon;
          const isCompleted = completionStatus[task.id];
          const isPastUncompleted = task.isPast && !isCompleted;

          // Determine priority level
          const getPriorityColor = () => {
            if (task.isActive && !isCompleted) return 'medium'; // Current task
            if (isPastUncompleted) return 'high'; // Missed task
            if (isCompleted) return 'low'; // Completed task
            return 'default';
          };

          const priority = getPriorityColor();

          return (
            <button
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`w-full text-right p-4 rounded-xl transition-all relative overflow-hidden group bg-background/70 backdrop-blur-sm border hover:shadow-md ${
                isCompleted
                  ? 'border-green-200/50 hover:border-green-300/60'
                  : task.isActive
                  ? 'border-amber-200/60 hover:border-amber-300/70 shadow-sm'
                  : isPastUncompleted
                  ? 'border-red-200/50 hover:border-red-300/60 opacity-80'
                  : 'border-border/40 hover:border-border/60'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Icon Circle with type-based colors */}
                <div
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-green-50 text-green-600'
                      : isPastUncompleted
                      ? 'bg-red-50 text-red-600'
                      : task.type === 'athkar'
                      ? task.isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-purple-50 text-purple-600'
                      : task.type === 'quran'
                      ? task.isActive
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-teal-50 text-teal-600'
                      : task.type === 'prayer'
                      ? task.isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-blue-50 text-blue-600'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold text-sm mb-1 ${
                      isCompleted
                        ? 'text-foreground/60 line-through'
                        : task.isActive
                        ? 'text-foreground'
                        : isPastUncompleted
                        ? 'text-foreground/70'
                        : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {task.time}
                  </p>
                </div>

                {/* Priority Badge with type colors */}
                {priority === 'high' && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      فائت
                    </span>
                  </div>
                )}
                {priority === 'medium' && (
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      task.type === 'athkar'
                        ? 'bg-purple-100 text-purple-800 border-purple-300/60'
                        : task.type === 'quran'
                        ? 'bg-teal-100 text-teal-800 border-teal-300/60'
                        : 'bg-blue-100 text-blue-800 border-blue-300/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        task.type === 'athkar'
                          ? 'bg-purple-600'
                          : task.type === 'quran'
                          ? 'bg-teal-600'
                          : 'bg-blue-600'
                      }`}></span>
                      الآن
                    </span>
                  </div>
                )}
                {priority === 'low' && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      مكتمل
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}