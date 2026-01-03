import { useState, useEffect } from 'react';
import { Heart, Copy, Link2, CheckCircle2, UserPlus, X } from 'lucide-react';

interface UserData {
  password: string;
  name: string;
  partnerCode: string;
  partnerId?: string;
}

interface PartnerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PartnerSettings({ isOpen, onClose }: PartnerSettingsProps) {
  const [myCode, setMyCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPartnerData();
    }
  }, [isOpen]);

  const loadPartnerData = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const { username } = JSON.parse(currentUser);
    const usersData = localStorage.getItem('appUsers');
    const users: Record<string, UserData> = usersData ? JSON.parse(usersData) : {};
    
    const userData = users[username];
    if (userData) {
      setMyCode(userData.partnerCode);
      
      // Check if already linked
      if (userData.partnerId) {
        const partner = users[userData.partnerId];
        if (partner) {
          setPartnerName(partner.name);
        }
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkPartner = () => {
    setError('');
    setSuccess('');

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const { username } = JSON.parse(currentUser);
    const usersData = localStorage.getItem('appUsers');
    const users: Record<string, UserData> = usersData ? JSON.parse(usersData) : {};

    // Find partner by code
    const partnerUsername = Object.keys(users).find(
      (key) => users[key].partnerCode === partnerCode.toUpperCase().trim()
    );

    if (!partnerUsername) {
      setError('الكود غير صحيح أو غير موجود');
      return;
    }

    if (partnerUsername === username) {
      setError('لا يمكنك ربط حسابك بنفسك!');
      return;
    }

    // Link both users
    users[username].partnerId = partnerUsername;
    users[partnerUsername].partnerId = username;

    localStorage.setItem('appUsers', JSON.stringify(users));
    
    setSuccess('تم الربط بنجاح! 💕');
    setPartnerName(users[partnerUsername].name);
    setPartnerCode('');
    
    setTimeout(() => {
      onClose();
      window.location.reload(); // Reload to update the app
    }, 1500);
  };

  const handleUnlink = () => {
    if (!confirm('هل أنت متأكد من فك الارتباط؟')) return;

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const { username } = JSON.parse(currentUser);
    const usersData = localStorage.getItem('appUsers');
    const users: Record<string, UserData> = usersData ? JSON.parse(usersData) : {};

    const partnerId = users[username].partnerId;
    if (partnerId) {
      delete users[username].partnerId;
      delete users[partnerId].partnerId;
      localStorage.setItem('appUsers', JSON.stringify(users));
      setPartnerName('');
      setSuccess('تم فك الارتباط');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-xl">ربط الشريك</h2>
                <p className="text-pink-100 text-sm">شارك رحلتك الإيمانية</p>
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

        <div className="p-6 space-y-6">
          {/* My Code */}
          <div>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="text-xl">🔑</span>
              كودك الخاص
            </h3>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">شارك هذا الكود مع شريكك</p>
                  <p className="text-2xl font-bold text-pink-600 tracking-widest font-mono">
                    {myCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`p-3 rounded-full transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-pink-200 hover:bg-pink-300 text-pink-700'
                  }`}
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Partner Status */}
          {partnerName ? (
            <div>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-xl">💑</span>
                الشريك المربوط
              </h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                      {partnerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-green-900">{partnerName}</p>
                      <p className="text-xs text-green-700">مرتبطين معاً 💚</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUnlink}
                    className="text-xs text-red-600 hover:text-red-700 underline"
                  >
                    فك الارتباط
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="text-xl">💞</span>
                ربط مع شريك
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    أدخل كود الشريك
                  </label>
                  <input
                    type="text"
                    value={partnerCode}
                    onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono tracking-widest text-center text-lg"
                    placeholder="XXXXXX"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                  </div>
                )}

                <button
                  onClick={handleLinkPartner}
                  disabled={partnerCode.length !== 6}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Link2 className="w-5 h-5" />
                  ربط الحسابات
                </button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span>ℹ️</span>
              كيف يعمل الربط؟
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• شارك كودك مع شريكك/شريكتك</li>
              <li>• اطلب منهم إدخال الكود في حسابهم</li>
              <li>• سيتم ربط الحسابات تلقائياً</li>
              <li>• ستتمكنون من رؤية progress بعض في التقرير الأسبوعي</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}