import { useState, useEffect } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { getDailyDuaaSchedule, getAllDuaas, type Duaa } from '../utils/duaaScheduler';

interface DailyDuaaCardProps {
  username: string;
}

export function DailyDuaaCard({ username }: DailyDuaaCardProps) {
  const [currentDuaa, setCurrentDuaa] = useState<Duaa | null>(null);
  const [manualRefresh, setManualRefresh] = useState(false);

  const updateDuaa = (forceRandom = false) => {
    const allDuaas = getAllDuaas(username);
    if (allDuaas.length === 0) {
      setCurrentDuaa(null);
      return;
    }

    if (forceRandom) {
      // Get random duaa when user clicks refresh
      const randomIndex = Math.floor(Math.random() * allDuaas.length);
      setCurrentDuaa(allDuaas[randomIndex]);
      setManualRefresh(true);
    } else if (manualRefresh) {
      // Keep showing the manually selected duaa
      return;
    } else {
      // Use schedule-based selection
      const schedule = getDailyDuaaSchedule(username);
      if (schedule.length === 0) {
        setCurrentDuaa(null);
        return;
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Find the current duaa based on time
      let selectedDuaa: Duaa | null = null;

      for (let i = 0; i < schedule.length; i++) {
        const slot = schedule[i];
        const slotHour = parseInt(slot.time.split(':')[0]);
        const slotMinute = parseInt(slot.time.split(':')[1]);

        if (currentHour < slotHour || (currentHour === slotHour && currentMinute < slotMinute)) {
          // Get the previous duaa
          if (i > 0) {
            selectedDuaa = schedule[i - 1].duaa;
          } else {
            selectedDuaa = schedule[schedule.length - 1].duaa;
          }
          break;
        }
      }

      // If no future slot found, we're after the last slot
      if (!selectedDuaa && schedule.length > 0) {
        selectedDuaa = schedule[schedule.length - 1].duaa;
      }

      setCurrentDuaa(selectedDuaa);
    }
  };

  useEffect(() => {
    updateDuaa();
    
    // Update every minute (only if not manually refreshed)
    const interval = setInterval(() => {
      if (!manualRefresh) {
        updateDuaa();
      }
    }, 60000);
    
    // Listen to custom event from DuaaJournal
    const handleDuaasUpdate = () => {
      setManualRefresh(false);
      updateDuaa();
    };
    window.addEventListener('duaasUpdated', handleDuaasUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('duaasUpdated', handleDuaasUpdate);
    };
  }, [username, manualRefresh]);

  if (!currentDuaa) {
    return null;
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/50 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">دعاء اليوم</h3>
            <p className="text-xs text-muted-foreground">من دفترك الشخصي</p>
          </div>
        </div>
        <button
          onClick={() => updateDuaa(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title="دعاء عشوائي"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Duaa Content */}
      <div className="mb-3">
        <p className="text-foreground leading-relaxed">
          {currentDuaa.content}
        </p>
      </div>

      {/* Footer */}
      {currentDuaa.is_shared && (
        <div className="text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400">
            دعاء مشترك
          </span>
        </div>
      )}
    </div>
  );
}