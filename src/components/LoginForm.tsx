import React, { useState } from 'react';
import { 
  Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2, 
  HelpCircle, ChevronDown, ChevronUp, ShieldAlert, Sparkles, X 
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  isAllowedAdminEmail
} from '../lib/firebase';
import { setAdminAuthenticated } from '../lib/storage';

interface LoginFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function LoginForm({ onSuccess, onClose }: LoginFormProps) {
  // Views: 'login' | 'forgot_password' | 'google_sim'
  const [mode, setMode] = useState<'login' | 'forgot_password' | 'google_sim'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Handles Email & Password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const lowerEmail = email.trim().toLowerCase();

    // Check email authorization BEFORE attempting login
    if (!isAllowedAdminEmail(lowerEmail)) {
      setAdminAuthenticated(false);
      setError(`Access Denied: The account email "${email}" is not authorized for administrator access.`);
      setLoading(false);
      return;
    }

    if (isFirebaseConfigured && auth) {
      // REAL FIREBASE SIGN IN
      try {
        await signInWithEmailAndPassword(auth!, lowerEmail, password);
        setAdminAuthenticated(true);
        onSuccess();
      } catch (err: any) {
        setAdminAuthenticated(false);
        console.error('Firebase Auth Error:', err);
        let errorMsg = 'Failed to authenticate. Please check your credentials.';
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          errorMsg = 'Invalid email or password. Please try again.';
        } else if (err.code === 'auth/too-many-requests') {
          errorMsg = 'Account temporarily locked due to too many failed login attempts. Try again later.';
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    } else {
      // SIMULATED LOGIN FOR PREVIEW
      setTimeout(() => {
        if (password === 'admin123') {
          setAdminAuthenticated(true);
          onSuccess();
        } else {
          setAdminAuthenticated(false);
          setError('Invalid password. Try password: admin123');
        }
        setLoading(false);
      }, 800);
    }
  };

  // Handles Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const lowerEmail = email.trim().toLowerCase();
    if (!isAllowedAdminEmail(lowerEmail)) {
      setError(`Access Denied: The email address "${email}" is not registered as an authorized administrator.`);
      setLoading(false);
      return;
    }

    if (isFirebaseConfigured && auth) {
      // REAL FIREBASE PASSWORD RESET EMAIL
      try {
        await sendPasswordResetEmail(auth!, lowerEmail);
        setSuccess(`A password reset link has been sent to ${email}. Please check your inbox.`);
      } catch (err: any) {
        console.error('Firebase Reset Password Error:', err);
        let errorMsg = 'Failed to send password reset email.';
        if (err.code === 'auth/user-not-found') {
          errorMsg = 'No registered user found with this email address.';
        } else if (err.code === 'auth/invalid-email') {
          errorMsg = 'Please enter a valid email address.';
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    } else {
      // SIMULATED PASSWORD RESET FOR PREVIEW
      setTimeout(() => {
        setSuccess(`[Simulation Mode] A demo password reset email has been initiated for ${email}. In a real environment, an email would be delivered!`);
        setLoading(false);
      }, 800);
    }
  };

  // Handles Google Sign-In
  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');

    if (isFirebaseConfigured && auth && googleProvider) {
      // REAL FIREBASE GOOGLE POPUP
      setLoading(true);
      try {
        const userCredential = await signInWithPopup(auth!, googleProvider!);
        const userEmail = userCredential.user?.email?.toLowerCase().trim();

        if (!userEmail || !isAllowedAdminEmail(userEmail)) {
          // Immediately revoke local auth and sign out unauthorized user
          setAdminAuthenticated(false);
          await signOut(auth!);
          setError(`Access Denied: The Google account "${userEmail || 'Unknown'}" is not authorized for administrator access.`);
          setLoading(false);
          return;
        }

        setAdminAuthenticated(true);
        onSuccess();
      } catch (err: any) {
        setAdminAuthenticated(false);
        console.error('Firebase Google Auth Error:', err);
        let errorMsg = err.message || 'Failed to authenticate via Google. Popup closed or blocked.';
        
        if (err.code === 'auth/configuration-not-found') {
          errorMsg = 'Google Sign-In has not been enabled in your Firebase console. Please go to console.firebase.google.com -> select your project -> Authentication -> Sign-in method, and enable Google Sign-In.';
        } else if (err.code === 'auth/popup-closed-by-user') {
          errorMsg = 'The login popup was closed before completion. Please try again.';
        } else if (err.code === 'auth/operation-not-allowed') {
          errorMsg = 'Google authentication is currently disabled for this project. Enable Google in the Firebase Authentication console.';
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    } else {
      // Trigger simulation overlay
      setMode('google_sim');
    }
  };

  const handleSimulatedGoogleSelect = (selectedEmail: string) => {
    const lowerEmail = selectedEmail.trim().toLowerCase();
    setLoading(true);
    setMode('login');
    setTimeout(() => {
      if (!isAllowedAdminEmail(lowerEmail)) {
        setAdminAuthenticated(false);
        setError(`Access Denied: Google account "${selectedEmail}" is unauthorized. Access is strictly limited to authorized administrators.`);
        setLoading(false);
        return;
      }
      setEmail(selectedEmail);
      setAdminAuthenticated(true);
      onSuccess();
      setLoading(false);
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Real Google Selector Simulation Overlay */}
      {mode === 'google_sim' && (
        <div 
          className="absolute inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              {/* Google multi-color G logo */}
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Choose an account</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                to continue to <span className="font-bold text-emerald-600 dark:text-emerald-400">Priyewrat Portfolio</span>
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <button 
                onClick={() => handleSimulatedGoogleSelect('priyewratsingh@gmail.com')}
                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-100 dark:border-zinc-800 rounded-xl transition text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold font-mono">P</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Priyewrat Singh</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-1">priyewratsingh@gmail.com</p>
                </div>
                <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold font-mono uppercase">Authorized</span>
              </button>

              <button 
                onClick={() => handleSimulatedGoogleSelect('priyewrat@gmail.com')}
                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-100 dark:border-zinc-800 rounded-xl transition text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold font-mono">P</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Priyewrat</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-1">priyewrat@gmail.com</p>
                </div>
                <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold font-mono uppercase">Authorized</span>
              </button>

              <button 
                onClick={() => handleSimulatedGoogleSelect('unauthorized.user@gmail.com')}
                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-100 dark:border-zinc-800 rounded-xl transition text-left opacity-75 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white text-xs font-bold font-mono">U</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">Other Google Account</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-1">unauthorized.user@gmail.com</p>
                </div>
                <span className="text-[9px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold font-mono uppercase">Unauthorized</span>
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[9px] text-zinc-400 font-mono">[Simulation Mode]</span>
              <button 
                onClick={() => setMode('login')}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                Back to email login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main LoginForm Modal */}
      <div 
        className="w-full max-w-md overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl transition-all relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right X Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition cursor-pointer z-20"
          title="Close login modal"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6 sm:p-8">
          
          {/* Top Status Header */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-400">ADMINISTRATOR PORTAL</span>
            
            {isFirebaseConfigured ? (
              <span className="flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-150 dark:border-emerald-900/40 font-extrabold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                FIREBASE CONNECTED
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-150 dark:border-amber-900/40 font-extrabold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                SANDBOX MODE
              </span>
            )}
          </div>

          {/* Form Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="p-3 mb-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              {mode === 'login' ? 'Admin Control Access' : 'Reset Password'}
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {mode === 'login' 
                ? 'Sign in to access your administrative tools and profile settings' 
                : 'Enter your email address to receive password resetting instructions'}
            </p>
          </div>

          {/* Dynamic Collapsible Firebase Setup Guide (Shown in Sandbox Mode to explain keys) */}
          {!isFirebaseConfigured && (
            <div className="mb-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-150/40 dark:hover:bg-zinc-850/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-500" />
                  <span>How to connect real Firebase Authentication?</span>
                </div>
                {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              
              {showGuide && (
                <div className="p-4 pt-1 border-t border-zinc-150 dark:border-zinc-850 text-2xs text-zinc-500 dark:text-zinc-400 space-y-2.5 font-sans leading-relaxed">
                  <p>
                    This app includes a fully wired, production-ready <strong className="text-zinc-700 dark:text-zinc-200">Firebase Auth framework</strong>. To use real user accounts:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Create a Firebase Project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-500 underline font-semibold">console.firebase.google.com</a>.</li>
                    <li>Enable <strong className="text-zinc-700 dark:text-zinc-200">Email/Password</strong> & <strong className="text-zinc-700 dark:text-zinc-200">Google Sign-in</strong> providers in Auth settings.</li>
                    <li>Add the following credentials to your environment variables in AI Studio settings:</li>
                  </ol>
                  <div className="p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl font-mono text-[9px] text-zinc-700 dark:text-zinc-300 space-y-1">
                    <div>VITE_FIREBASE_API_KEY="..."</div>
                    <div>VITE_FIREBASE_AUTH_DOMAIN="..."</div>
                    <div>VITE_FIREBASE_PROJECT_ID="..."</div>
                  </div>
                  <p className="text-amber-600 dark:text-amber-400 italic">
                    * The sandbox credentials below will authorize you instantly in this preview.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 mb-5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3.5 mb-5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/40 dark:border-emerald-900/30 rounded-xl">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          {/* MAIN LOGIN MODE */}
          {mode === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </div>

              {/* Continue with Google Block */}
              <div className="relative my-6 flex py-1.5 items-center">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-zinc-400 uppercase font-bold font-mono tracking-widest">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-855 rounded-xl font-bold text-sm text-zinc-700 dark:text-zinc-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {/* Standard multi-color Google logo SVG */}
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          ) : (
            /* FORGOT PASSWORD MODE */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending reset email...</span>
                    </>
                  ) : (
                    <span>Send Password Reset Email</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full py-2 flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* Sandbox mode notice block */}
          {/* {mode === 'login' && !isFirebaseConfigured && (
            <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150 dark:border-zinc-850 rounded-xl text-[10px] text-zinc-500 dark:text-zinc-400 text-center">
              <span className="font-extrabold text-zinc-700 dark:text-zinc-300">Sandbox Quick Credentials:</span>
              <br />
              Email: <code className="text-zinc-800 dark:text-zinc-200">solutionsneekers@gmail.com</code>
              <br />
              Password: <code className="text-zinc-800 dark:text-zinc-200">admin123</code>
            </div>
          )} */}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-extrabold tracking-wide uppercase text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
