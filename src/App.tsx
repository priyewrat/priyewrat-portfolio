import React, { useState, useEffect } from 'react';
import { Eye, Edit, ShieldCheck, LogOut, LayoutGrid } from 'lucide-react';
import { getPortfolioData, isAdminAuthenticated, setAdminAuthenticated } from './lib/storage';
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

  // Load initial state and set up Firebase Auth listener
  useEffect(() => {
    setPortfolioData(getPortfolioData());

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth!, async (user) => {
        if (user && isAllowedAdminEmail(user.email)) {
          setAdminAuthenticated(true);
          setIsAdmin(true);
        } else {
          // If unauthorized user is signed into Firebase, force sign-out
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
      return () => unsubscribe();
    } else {
      const authStatus = isAdminAuthenticated();
      setIsAdmin(authStatus);
      if (!authStatus) {
        setViewMode('preview');
      }
    }
  }, []);

  // Update states when portfolio data changes in dashboard
  const handleDataChange = () => {
    setPortfolioData(getPortfolioData());
  };

  const handleOpenLoginModal = () => {
    // If not authenticated, ensure admin mode is disabled while logging in
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
    // When closing login modal without completing authentication, strictly revoke admin view
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
    setViewMode('admin'); // Instantly navigate to admin panel upon success
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
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-zinc-400 font-semibold">Initializing Priyewrat's Portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      
      {/* Admin Floating Control Strip (Shown only to logged in administrators) */}
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

      {/* Primary Display Switch */}
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

      {/* Floating Modal for Admin login credentials */}
      {showLoginModal && (
        <LoginForm 
          onSuccess={handleLoginSuccess} 
          onClose={handleCloseLoginModal} 
        />
      )}

    </div>
  );
}
