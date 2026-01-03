import { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: '05:15',
    dhuhr: '12:30',
    asr: '15:45',
    maghrib: '18:20',
    isha: '19:45',
  });

  useEffect(() => {
    const saved = localStorage.getItem('prayer-times-settings');
    if (saved) {
      setPrayerTimes(JSON.parse(saved));
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('prayer-times-settings', JSON.stringify(prayerTimes));
    onClose();
    // Reload the page to apply changes
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-card rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">الإعدادات</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-secondary rounded-lg p-1.5 sm:p-2 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-xs sm:text-sm text-foreground/80 text-center">
              📍 مواقيت الصلاة يتم جلبها تلقائياً من عمّان، الأردن
            </p>
          </div>

          <div>
            <Label htmlFor="fajr" className="text-sm sm:text-base">الفجر</Label>
            <Input
              id="fajr"
              type="time"
              value={prayerTimes.fajr}
              onChange={(e) => setPrayerTimes({ ...prayerTimes, fajr: e.target.value })}
              className="mt-1.5 sm:mt-2 text-sm sm:text-base"
              disabled
            />
          </div>

          <div>
            <Label htmlFor="dhuhr" className="text-sm sm:text-base">الظهر</Label>
            <Input
              id="dhuhr"
              type="time"
              value={prayerTimes.dhuhr}
              onChange={(e) => setPrayerTimes({ ...prayerTimes, dhuhr: e.target.value })}
              className="mt-1.5 sm:mt-2 text-sm sm:text-base"
              disabled
            />
          </div>

          <div>
            <Label htmlFor="asr" className="text-sm sm:text-base">العصر</Label>
            <Input
              id="asr"
              type="time"
              value={prayerTimes.asr}
              onChange={(e) => setPrayerTimes({ ...prayerTimes, asr: e.target.value })}
              className="mt-1.5 sm:mt-2 text-sm sm:text-base"
              disabled
            />
          </div>

          <div>
            <Label htmlFor="maghrib" className="text-sm sm:text-base">المغرب</Label>
            <Input
              id="maghrib"
              type="time"
              value={prayerTimes.maghrib}
              onChange={(e) => setPrayerTimes({ ...prayerTimes, maghrib: e.target.value })}
              className="mt-1.5 sm:mt-2 text-sm sm:text-base"
              disabled
            />
          </div>

          <div>
            <Label htmlFor="isha" className="text-sm sm:text-base">العشاء</Label>
            <Input
              id="isha"
              type="time"
              value={prayerTimes.isha}
              onChange={(e) => setPrayerTimes({ ...prayerTimes, isha: e.target.value })}
              className="mt-1.5 sm:mt-2 text-sm sm:text-base"
              disabled
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-border flex gap-2 sm:gap-3 sticky bottom-0 bg-card">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 text-sm sm:text-base"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}