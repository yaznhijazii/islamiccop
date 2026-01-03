import { useState, useEffect } from 'react';
import { BookOpen, X, Loader2, Check, ChevronRight, ChevronLeft, RotateCcw, Bookmark } from 'lucide-react';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

interface SurahData {
  ayahs: Ayah[];
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface SurahProgress {
  currentPage: number;
  currentAyah: number;
  totalPages: number;
  completed: boolean;
}

const SURAHS = {
  baqarah: { id: 2, name: 'سورة البقرة', pages: 7, ayahsPerPage: 41 },
  mulk: { id: 67, name: 'سورة الملك', pages: 1, ayahsPerPage: 30 },
  kahf: { id: 18, name: 'سورة الكهف', pages: 1, ayahsPerPage: 110 },
};

export function QuranReader() {
  const [selectedSurah, setSelectedSurah] = useState<keyof typeof SURAHS | null>(null);
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Record<string, SurahProgress>>({});

  useEffect(() => {
    loadProgress();
    window.addEventListener('storage', loadProgress);
    return () => window.removeEventListener('storage', loadProgress);
  }, []);

  const loadProgress = () => {
    const today = new Date().toDateString();
    const currentUser = localStorage.getItem('currentUser');
    const username = currentUser ? JSON.parse(currentUser).username : 'guest';
    
    const savedProgress: Record<string, SurahProgress> = {};
    
    Object.keys(SURAHS).forEach((key) => {
      const surahKey = key as keyof typeof SURAHS;
      const storageKey = `quran-progress-${surahKey}-${username}-${today}`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        savedProgress[surahKey] = JSON.parse(saved);
      } else {
        savedProgress[surahKey] = {
          currentPage: 1,
          currentAyah: 0,
          totalPages: SURAHS[surahKey].pages,
          completed: false,
        };
      }
    });
    
    setProgress(savedProgress);
  };

  const saveProgress = (surahKey: keyof typeof SURAHS, page: number, ayah: number, completed: boolean) => {
    const today = new Date().toDateString();
    const currentUser = localStorage.getItem('currentUser');
    const username = currentUser ? JSON.parse(currentUser).username : 'guest';
    
    const storageKey = `quran-progress-${surahKey}-${username}-${today}`;
    const progressData: SurahProgress = {
      currentPage: page,
      currentAyah: ayah,
      totalPages: SURAHS[surahKey].pages,
      completed,
    };
    
    localStorage.setItem(storageKey, JSON.stringify(progressData));
    
    if (completed) {
      const oldStorageKey = `quran-${username}-${today}`;
      const existing = localStorage.getItem(oldStorageKey);
      const data = existing ? JSON.parse(existing) : {};
      data[surahKey] = true;
      localStorage.setItem(oldStorageKey, JSON.stringify(data));
    }
    
    window.dispatchEvent(new Event('storage'));
    loadProgress();
  };

  const fetchSurah = async (surahKey: keyof typeof SURAHS) => {
    setLoading(true);
    setSelectedSurah(surahKey);
    
    const savedPage = progress[surahKey]?.currentPage || 1;
    const savedAyah = progress[surahKey]?.currentAyah || 0;
    setCurrentPage(savedPage);
    setCurrentAyah(savedAyah);

    try {
      const url = `https://api.alquran.cloud/v1/surah/${SURAHS[surahKey].id}/quran-simple`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Remove Bismillah from first ayah of Mulk and Kahf (keep it only in Baqarah)
      if (surahKey === 'mulk' || surahKey === 'kahf') {
        const firstAyah = data.data.ayahs[0];
        if (firstAyah && firstAyah.text) {
          // Remove the Bismillah from the beginning
          firstAyah.text = firstAyah.text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, '');
        }
      }
      
      setSurahData(data.data);
    } catch (err) {
      console.error('Error fetching surah:', err);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setSelectedSurah(null);
    setSurahData(null);
    setCurrentPage(1);
    setCurrentAyah(0);
  };

  const handleNextPage = () => {
    if (!selectedSurah) return;
    
    const totalPages = SURAHS[selectedSurah].pages;
    const nextPage = currentPage + 1;
    
    if (nextPage <= totalPages) {
      setCurrentPage(nextPage);
      setCurrentAyah(0);
      saveProgress(selectedSurah, nextPage, 0, false);
    } else {
      saveProgress(selectedSurah, totalPages, 0, true);
      close();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      setCurrentAyah(0);
      if (selectedSurah) {
        saveProgress(selectedSurah, prevPage, 0, false);
      }
    }
  };

  const handleReset = (surahKey: keyof typeof SURAHS) => {
    saveProgress(surahKey, 1, 0, false);
  };

  const handleAyahClick = (ayahNumber: number) => {
    if (!selectedSurah) return;
    setCurrentAyah(ayahNumber);
    saveProgress(selectedSurah, currentPage, ayahNumber, false);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const getCurrentPageAyahs = (): Ayah[] => {
    if (!surahData || !selectedSurah) return [];
    
    const ayahsPerPage = SURAHS[selectedSurah].ayahsPerPage;
    const startIndex = (currentPage - 1) * ayahsPerPage;
    const endIndex = startIndex + ayahsPerPage;
    
    let ayahs = surahData.ayahs.slice(startIndex, endIndex);
    
    if (selectedSurah === 'baqarah' && currentPage === 1 && ayahs.length > 0) {
      ayahs = ayahs.slice(1);
    }
    
    return ayahs;
  };

  const isFriday = new Date().getDay() === 5;

  return (
    <div className="space-y-4">
      {/* Quran Cards - Enhanced Identity */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 shadow-md overflow-hidden">
        {/* Decorative Islamic Pattern Background */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" className="text-emerald-900">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-[0.03] pointer-events-none">
          <svg viewBox="0 0 100 100" className="text-emerald-900">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>

        <div className="relative">
          <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 text-lg">
            <span className="text-2xl">📖</span>
            <span>القرآن الكريم</span>
            <div className="h-px flex-1 bg-gradient-to-l from-emerald-300/40 to-transparent mr-3"></div>
          </h3>
        </div>
        
        {/* Horizontal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
          {/* Baqarah - Golden/Orange Theme */}
          <div className="relative bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-yellow-50/40 rounded-xl p-4 border-2 border-amber-200/70 shadow-sm hover:shadow-md transition-all group">
            {/* Corner decorations */}
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-300/50 rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-300/50 rounded-bl-lg"></div>
            
            {/* Small decorative star */}
            <div className="absolute top-3 left-3 text-amber-400/20 text-xs">✦</div>
            
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  سورة البقرة
                  <span className="text-amber-500/60 text-xs">✦</span>
                </h4>
                <p className="text-xs text-emerald-700/80 mt-0.5">286 آية • 7 صفحات يومياً</p>
              </div>
              {progress.baqarah?.completed && (
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <Check className="w-3 h-3" />
                  ✓
                </div>
              )}
            </div>
            
            {progress.baqarah && progress.baqarah.currentAyah > 0 && !progress.baqarah.completed && (
              <div className="mb-2 flex items-center gap-1 text-xs text-amber-800 bg-amber-100/80 px-2 py-1 rounded-lg border border-amber-200/50">
                <Bookmark className="w-3 h-3 fill-amber-700" />
                <span className="font-medium">آية {progress.baqarah.currentAyah}</span>
              </div>
            )}
            
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-emerald-700 mb-1.5 font-medium">
                <span>صفحة {progress.baqarah?.currentPage || 1} من 7</span>
                <span className="bg-emerald-100/80 px-2 py-0.5 rounded-full">{Math.round(((progress.baqarah?.currentPage || 1) / 7) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-emerald-100/70 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-300"
                  style={{ width: `${((progress.baqarah?.currentPage || 1) / 7) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fetchSurah('baqarah')}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2 rounded-lg transition-all font-semibold text-sm shadow-sm"
              >
                {progress.baqarah?.currentPage > 1 || progress.baqarah?.currentAyah > 0 ? 'أكمل' : 'ابدأ'}
              </button>
              
              {progress.baqarah && (progress.baqarah.currentPage > 1 || progress.baqarah.currentAyah > 0) && (
                <button
                  onClick={() => handleReset('baqarah')}
                  className="bg-amber-100 hover:bg-amber-200 text-emerald-700 p-2 rounded-lg transition-all shadow-sm"
                  title="إعادة من البداية"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mulk - Purple Theme */}
          <div className="relative bg-gradient-to-br from-purple-50/80 via-indigo-50/50 to-violet-50/30 rounded-xl p-4 border-2 border-purple-200/70 shadow-sm hover:shadow-md transition-all group">
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-purple-300/50 rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-purple-300/50 rounded-bl-lg"></div>
            <div className="absolute top-3 left-3 text-purple-400/20 text-xs">✦</div>
            
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                  سورة الملك
                  <span className="text-purple-500/60 text-xs">✦</span>
                </h4>
                <p className="text-xs text-emerald-700/80 mt-0.5">30 آية • مسائياً</p>
              </div>
              {progress.mulk?.completed && (
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <Check className="w-3 h-3" />
                  ✓
                </div>
              )}
            </div>
            
            {progress.mulk && progress.mulk.currentAyah > 0 && !progress.mulk.completed && (
              <div className="mb-2 flex items-center gap-1 text-xs text-amber-800 bg-amber-100/80 px-2 py-1 rounded-lg border border-amber-200/50">
                <Bookmark className="w-3 h-3 fill-amber-700" />
                <span className="font-medium">آية {progress.mulk.currentAyah}</span>
              </div>
            )}
            
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-emerald-700 mb-1.5 font-medium">
                <span>صفحة {progress.mulk?.currentPage || 1} من 1</span>
                <span className="bg-emerald-100/80 px-2 py-0.5 rounded-full">{Math.round(((progress.mulk?.currentPage || 1) / 1) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-emerald-100/70 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-300"
                  style={{ width: `${((progress.mulk?.currentPage || 1) / 1) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fetchSurah('mulk')}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2 rounded-lg transition-all font-semibold text-sm shadow-sm"
              >
                {progress.mulk?.currentPage > 1 || progress.mulk?.currentAyah > 0 ? 'أكمل' : 'ابدأ'}
              </button>
              
              {progress.mulk && (progress.mulk.currentPage > 1 || progress.mulk.currentAyah > 0) && (
                <button
                  onClick={() => handleReset('mulk')}
                  className="bg-purple-100 hover:bg-purple-200 text-emerald-700 p-2 rounded-lg transition-all shadow-sm"
                  title="إعادة من البداية"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Kahf - Friday only */}
          <div className={`relative bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 rounded-xl p-4 border-2 border-emerald-200/80 shadow-sm hover:shadow-md transition-all ${
            isFriday ? '' : 'opacity-50'
          }`}>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-300/40 rounded-tr-lg"></div>
            
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-emerald-900 flex items-center gap-1">
                  سورة الكهف
                  {isFriday && <span className="text-base">⭐</span>}
                </h4>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {isFriday ? '110 آية • الجمعة' : 'الجمعة فقط'}
                </p>
              </div>
              {isFriday && progress.kahf?.completed && (
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  ✓
                </div>
              )}
            </div>
            
            {isFriday && progress.kahf && progress.kahf.currentAyah > 0 && !progress.kahf.completed && (
              <div className="mb-2 flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                <Bookmark className="w-3 h-3" />
                <span>آية {progress.kahf.currentAyah}</span>
              </div>
            )}
            
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-emerald-600 mb-1">
                <span>ص {progress.kahf?.currentPage || 1}/1</span>
                <span>{Math.round(((progress.kahf?.currentPage || 1) / 1) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${((progress.kahf?.currentPage || 1) / 1) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => fetchSurah('kahf')}
                disabled={!isFriday}
                className={`flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-all font-semibold text-sm ${
                  isFriday ? '' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isFriday ? (progress.kahf?.completed ? 'قراءة مجددة' : 'ابدأ القراءة') : 'غير متاحة'}
              </button>
              
              {isFriday && progress.kahf && (progress.kahf.currentPage > 1 || progress.kahf.currentAyah > 0) && (
                <button
                  onClick={() => handleReset('kahf')}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-2 rounded-lg transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      {selectedSurah && surahData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-amber-50 via-white to-emerald-50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-2 border-emerald-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-4 border-b border-emerald-600 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{SURAHS[selectedSurah].name}</span>
                </h2>
                <div className="flex items-center gap-3 text-sm text-emerald-100 mt-1">
                  {SURAHS[selectedSurah].pages > 1 && (
                    <span>صفحة {currentPage} من {SURAHS[selectedSurah].pages}</span>
                  )}
                  {currentAyah > 0 && (
                    <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                      <Bookmark className="w-3 h-3" />
                      آية {currentAyah}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={close}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bismillah */}
                  {currentPage === 1 && (
                    <div className="text-center mb-6 pb-4 border-b border-emerald-200">
                      <p className="quran-text text-2xl text-emerald-900">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                      </p>
                    </div>
                  )}

                  {/* Ayahs */}
                  <div className="bg-white rounded-xl p-6 border border-emerald-200 shadow-sm">
                    <div className="quran-text text-right leading-loose text-xl" style={{ lineHeight: '2.5' }}>
                      {getCurrentPageAyahs().map((ayah) => (
                        <span key={ayah.number}>
                          <span className="text-gray-800">{ayah.text}</span>
                          <button
                            onClick={() => handleAyahClick(ayah.numberInSurah)}
                            className={`inline-flex items-center justify-center mx-1.5 my-1 w-8 h-8 text-sm rounded-full font-bold transition-all hover:scale-105 ${
                              ayah.numberInSurah === currentAyah 
                                ? 'bg-amber-500 text-white shadow-md' 
                                : ayah.numberInSurah <= currentAyah
                                ? 'bg-emerald-200 text-emerald-700'
                                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                            }`}
                          >
                            {ayah.numberInSurah}
                          </button>
                          {' '}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-t from-emerald-50 to-white p-4 border-t border-emerald-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                <div className="flex-1 text-center">
                  {SURAHS[selectedSurah].pages > 1 && (
                    <div className="text-sm text-emerald-700 font-semibold">
                      {currentPage} / {SURAHS[selectedSurah].pages}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNextPage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-all"
                >
                  <span>
                    {currentPage === SURAHS[selectedSurah].pages ? 'إنهاء' : 'التالي'}
                  </span>
                  {currentPage === SURAHS[selectedSurah].pages ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}