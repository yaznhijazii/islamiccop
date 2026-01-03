import { DailyHeader } from './components/DailyHeader';
import { NotificationBanner } from './components/NotificationBanner';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { InteractiveTimeline } from './components/InteractiveTimeline';
import { DailyDuaaCard } from './components/DailyDuaaCard';
import { PodcastCard } from './components/PodcastCard';
import { QuranReader } from './components/QuranReader';
import { AthkarReader } from './components/AthkarReader';
import { PartnerSettings } from './components/PartnerSettings';
import { WeeklyReport } from './components/WeeklyReport';
import { DuaaJournal } from './components/DuaaJournal';
import { FloatingMenu } from './components/FloatingMenu';
import { useState, useEffect } from 'react';
import { useTimeOfDay, timeOfDayConfig } from './hooks/useTimeOfDay';
import { migrateOldUsers } from './utils/migrateUsers';
import logoImage from "../assets/norna.png";

interface User {
  username: string;
  name: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPartnerSettings, setShowPartnerSettings] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [showDuaaJournal, setShowDuaaJournal] = useState(false);
  const [themeMode, setThemeMode] = useState<'auto' | 'light' | 'dark'>('auto');
  const systemTimeOfDay = useTimeOfDay();

  // Set document title
  useEffect(() => {
    document.title = 'نورنا - يضيء بالإيمان';
    
    // Set favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = logoImage;
    document.getElementsByTagName('head')[0].appendChild(link);
    
    // Migrate old users on first load
    migrateOldUsers();
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    const savedTheme = localStorage.getItem('themeMode') as 'auto' | 'light' | 'dark';
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  const handleLogin = (username: string, name: string) => {
    const user = { username, name };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const toggleTheme = () => {
    const themes: ('auto' | 'light' | 'dark')[] = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(themeMode);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setThemeMode(nextTheme);
    localStorage.setItem('themeMode', nextTheme);
  };

  // Show login screen if not logged in
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const activeTimeOfDay = themeMode === 'auto' ? systemTimeOfDay : themeMode;
  const timeConfig = timeOfDayConfig[activeTimeOfDay];

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${timeConfig.gradient} animate-gradient pb-safe relative overflow-hidden`}
      style={{ 
        fontFamily: "'IBM Plex Sans Arabic', sans-serif", 
        direction: 'rtl' 
      }}
    >
      {/* Floating particles for ambiance */}
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>
      <div className="floating-particle"></div>

      {/* Notification Banner */}
      <NotificationBanner />
      
      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Partner Settings Modal */}
      <PartnerSettings isOpen={showPartnerSettings} onClose={() => setShowPartnerSettings(false)} />

      {/* Weekly Report Modal */}
      <WeeklyReport isOpen={showWeeklyReport} onClose={() => setShowWeeklyReport(false)} />

      {/* Duaa Journal Modal */}
      <DuaaJournal isOpen={showDuaaJournal} onClose={() => setShowDuaaJournal(false)} />

      {/* Floating Menu */}
      <FloatingMenu
        onSettingsClick={() => setShowSettings(true)}
        onPartnerClick={() => setShowPartnerSettings(true)}
        onReportClick={() => setShowWeeklyReport(true)}
        onDuaaClick={() => setShowDuaaJournal(true)}
        onLogout={handleLogout}
        onThemeToggle={toggleTheme}
        themeMode={themeMode}
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <DailyHeader userName={currentUser.name} />
        </div>

        {/* Main Content: Timeline + Reader */}
        <div className="mb-6 sm:mb-8 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Timeline - 25% on desktop */}
          <div className="lg:col-span-1 space-y-4">
            <InteractiveTimeline />
            <DailyDuaaCard username={currentUser.username} />
          </div>

          {/* Right Column - Quran Reader + Athkar + Podcast */}
          <div className="lg:col-span-3 space-y-4">
            {/* Quran Reader */}
            <QuranReader />
            
            {/* Athkar Reader */}
            <AthkarReader />
            
            {/* Podcast Card - Smaller and under Quran */}
            <PodcastCard />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center pb-6 sm:pb-8">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            جعل الله هذا العمل خالصاً لوجهه الكريم
          </p>
          <p 
            className="text-sm sm:text-base text-emerald-700 dark:text-emerald-300" 
            style={{ fontFamily: "'IBM Plex Sans Arabic', serif" }}
          >
            ﴿وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ﴾
          </p>
        </div>
      </div>
    </div>
  );
}