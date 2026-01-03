import { useState } from 'react';
import { Settings, LogOut, Sun, Moon, Heart, BarChart, Menu, X, BookHeart } from 'lucide-react';

interface FloatingMenuProps {
  onSettingsClick: () => void;
  onPartnerClick: () => void;
  onReportClick: () => void;
  onDuaaClick: () => void;
  onLogout: () => void;
  onThemeToggle: () => void;
  themeMode: 'auto' | 'light' | 'dark';
}

export function FloatingMenu({
  onSettingsClick,
  onPartnerClick,
  onReportClick,
  onDuaaClick,
  onLogout,
  onThemeToggle,
  themeMode
}: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: Settings,
      label: 'الإعدادات',
      onClick: onSettingsClick,
      color: 'from-teal-500/70 to-cyan-500/70',
      hoverColor: 'hover:from-teal-600/80 hover:to-cyan-600/80'
    },
    {
      icon: themeMode === 'auto' ? Sun : themeMode === 'light' ? Sun : Moon,
      label: themeMode === 'auto' ? 'تلقائي' : themeMode === 'light' ? 'نهار' : 'ليل',
      onClick: onThemeToggle,
      color: 'from-amber-500/70 to-orange-500/70',
      hoverColor: 'hover:from-amber-600/80 hover:to-orange-600/80'
    },
    {
      icon: Heart,
      label: 'ربط الشريك',
      onClick: onPartnerClick,
      color: 'from-pink-500/70 to-rose-500/70',
      hoverColor: 'hover:from-pink-600/80 hover:to-rose-600/80'
    },
    {
      icon: BarChart,
      label: 'التقرير الأسبوعي',
      onClick: onReportClick,
      color: 'from-blue-500/70 to-indigo-500/70',
      hoverColor: 'hover:from-blue-600/80 hover:to-indigo-600/80'
    },
    {
      icon: BookHeart,
      label: 'دعاء',
      onClick: onDuaaClick,
      color: 'from-green-500/70 to-emerald-500/70',
      hoverColor: 'hover:from-green-600/80 hover:to-emerald-600/80'
    },
    {
      icon: LogOut,
      label: 'تسجيل الخروج',
      onClick: onLogout,
      color: 'from-red-500/70 to-rose-500/70',
      hoverColor: 'hover:from-red-600/80 hover:to-rose-600/80'
    }
  ];

  return (
    <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[9999]">
      {/* Main Toggle Button */}
      <button
        onClick={toggleMenu}
        className={`
          w-11 h-11 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300
          backdrop-blur-md
          ${isOpen 
            ? 'bg-red-500/20 border-2 border-red-500/50 rotate-90' 
            : 'bg-white/20 dark:bg-black/20 border-2 border-white/30 dark:border-white/20 hover:scale-110 hover:bg-white/30 dark:hover:bg-black/30'
          }
        `}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-red-500 dark:text-red-400" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        )}
      </button>

      {/* Menu Items - Icon Only Buttons */}
      <div className="flex flex-col items-start gap-2 mt-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleAction(item.onClick)}
            title={item.label}
            className={`
              ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
              transition-all duration-300 ease-out
              bg-gradient-to-r ${item.color} ${item.hoverColor}
              backdrop-blur-md
              text-white rounded-full shadow-lg
              w-11 h-11
              flex items-center justify-center
              transform hover:scale-110
              group
            `}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
            }}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
}