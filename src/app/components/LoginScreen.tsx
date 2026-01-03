import { useState } from 'react';
import { Heart, Lock, User, LogIn, UserPlus } from 'lucide-react';
import logoImage from "../../assets/norna.png";

interface LoginScreenProps {
  onLogin: (username: string, name: string) => void;
}

interface UserData {
  password: string;
  name: string;
  partnerCode: string;
  partnerId?: string;
}

// Generate unique partner code
const generatePartnerCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Get users from localStorage
    const usersData = localStorage.getItem('appUsers');
    const users: Record<string, UserData> = usersData ? JSON.parse(usersData) : {};
    
    const user = users[username];
    
    if (!user || user.password !== password) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      return;
    }

    onLogin(username, user.name);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (name.trim().length < 2) {
      setError('الرجاء إدخال الاسم الكامل');
      return;
    }

    // Get existing users
    const usersData = localStorage.getItem('appUsers');
    const users: Record<string, UserData> = usersData ? JSON.parse(usersData) : {};

    // Check if username exists
    if (users[username]) {
      setError('اسم المستخدم موجود مسبقاً');
      return;
    }

    // Create new user with partner code
    const newUser: UserData = {
      password,
      name: name.trim(),
      partnerCode: generatePartnerCode()
    };

    users[username] = newUser;
    localStorage.setItem('appUsers', JSON.stringify(users));

    // Auto login
    onLogin(username, newUser.name);
  };

  const handleSubmit = mode === 'login' ? handleLogin : handleSignup;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src={logoImage} 
              alt="نورنا" 
              className="w-20 h-20 rounded-2xl shadow-2xl"
            />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-3xl text-foreground">نورنا</h1>
            <p className="text-base text-muted-foreground mt-1">حب يضيء بالإيمان</p>
          </div>
        </div>

        <div className="relative bg-card rounded-3xl shadow-2xl p-8 border border-border/50">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 bg-secondary/30 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  الاسم الكامل
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="مثال: نور وريكات"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                اسم المستخدم
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder={mode === 'signup' ? 'اختر اسم مستخدم' : 'أدخل اسم المستخدم'}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  إنشاء حساب
                </>
              )}
            </button>
          </form>

          {/* Info */}
          {mode === 'signup' && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                ✨ سيتم إنشاء كود خاص بك لربط حسابك مع شريكك
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}