import React, { useState, useEffect } from 'react';
import { Eye, Edit, ShieldCheck, LogOut } from 'lucide-react';
import { isAdminAuthenticated, setAdminAuthenticated, initPortfolioData } from './lib/storage';
import { PortfolioData } from './types';
import PortfolioView from './components/PortfolioView';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/LoginForm';
import { auth, isFirebaseConfigured, onAuthStateChanged, signOut, isAllowedAdminEmail } from './lib/firebase';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'admin'>('preview');

  useEffect(() => {
    // 🔥 Subscribe to Firestore portfolio data
    const unsubPortfolio = initPortfolioData((cloudData) => {
      setPortfolioData(cloudData);
    });

    // Firebase Auth listener
    let unsubAuth: (() => void) | undefined;
    if (isFirebaseConfigured && auth) {
      unsubAuth = onAuthStateChanged(auth!, async (user) => {
        if (user && isAllowedAdminEmail(user.email)) {
          setAdminAuthenticated(true);
          setIsAdmin(true);
        } else {
          if (user && !isAllowedAdminEmail(user.email)) {
            console.warn(`Unauthorized login attempt by: ${user.email}`);
            try {
              await signOut(auth!);
            } catch (err) {
              console.error('Error signing out unauthorized user:', err);
            }
          }
          setAdminAuthenticated(false);
          setIsAdmin(false);
          setViewMode('preview');
        }
      });
    } else {
      const authStatus = isAdminAuthenticated();
      setIsAdmin(authStatus);
      if (!authStatus) {
        setViewMode('preview');
      }
    }

    return () => {
      unsubPortfolio();
      if (unsubAuth) unsubAuth();
    };
  }, []);

  const handleDataChange = () => {
    // Firestore subscription will update portfolioData automatically
  };

  const handleOpenLoginModal = () => {
    const isAuth = isFirebaseConfigured && auth 
      ? (auth.currentUser ? isAllowedAdminEmail(auth.currentUser.email) : false)
      : isAdminAuthenticated();

    if (!isAuth) {
      setIsAdmin(false);
      setAdminAuthenticated(false);
      setViewMode('preview');
    }
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    const isAuth = isFirebaseConfigured && auth 
      ? (auth.currentUser ? isAllowedAdminEmail(auth.currentUser.email) : false)
      : isAdminAuthenticated();

    if (!isAuth) {
      setIsAdmin(false);
      setAdminAuthenticated(false);
      setViewMode('preview');
    }
  };

  const handleLoginSuccess = () => {
    setAdminAuthenticated(true);
    setIsAdmin(true);
    setShowLoginModal(false);
    setViewMode('admin');
  };

  const handleLogout = async () => {
    setAdminAuthenticated(false);
    setIsAdmin(false);
    setViewMode('preview');

    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth!);
      } catch (err) {
        console.error('Error signing out of Firebase:', err);
      }
    }
  };

  if (!portfolioData) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        {/* Profile header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-300 dark:bg-zinc-800"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-300 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 w-48 bg-zinc-300 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>

        {/* Section skeletons */}
        <div className="h-4 w-1/2 bg-zinc-300 dark:bg-zinc-800 rounded"></div>
        <div className="h-3 w-3/4 bg-zinc-300 dark:bg-zinc-800 rounded"></div>
        <div className="h-3 w-2/3 bg-zinc-300 dark:bg-zinc-800 rounded"></div>

        {/* Projects grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-300 dark:bg-zinc-800 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      
      {isAdmin && (
        <div className="sticky top-0 z-50 bg-zinc-900 text-white border-b border-zinc-800 text-xs px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-md">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold">Logged in as Administrator</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                viewMode === 'admin' 
                  ? 'bg-emerald-600 text-white shadow-sm cursor-pointer' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Admin Editor Panel</span>
            </button>

            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition ${
                viewMode === 'preview' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Portfolio Preview</span>
            </button>

            <span className="text-zinc-700 font-bold mx-1">|</span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg font-semibold transition cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow">
        {viewMode === 'admin' && isAdmin ? (
          <AdminDashboard onLogout={handleLogout} onDataChange={handleDataChange} />
        ) : (
          <PortfolioView 
            onLoginClick={handleOpenLoginModal} 
            portfolioData={portfolioData} 
          />
        )}
      </main>

      {showLoginModal && (
        <LoginForm 
          onSuccess={handleLoginSuccess} 
          onClose={handleCloseLoginModal} 
        />
      )}
    </div>
  );
}
