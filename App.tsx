import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Loading from './components/Loading';
import type { User, Settings } from './types';
import * as db from './db';

// Lazy load dashboard pages untuk code splitting
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const UserDashboardPage = lazy(() => import('./components/UserDashboardPage'));

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | 'admin' | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    libraryName: 'PERPUSTAKAAN DIGITAL PPI 19 GARUT',
    adminPassword: 'ppi19adm', // Default password sebagai fallback
    loginLogo: '',
    adminPhoto: ''
  });

  // Load settings and restore login session on mount
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Load Settings
      try {
        // Try localStorage first
        const localSettings = localStorage.getItem('literasi_settings');
        if (localSettings) {
          const parsed = JSON.parse(localSettings);
          setSettings(parsed);
          console.log('Loaded settings from localStorage:', parsed);
        } else {
          // Fallback to database
          const remoteSettings = await db.fetchSettings();
          if (remoteSettings) {
            setSettings(remoteSettings);
            console.log('Loaded settings from database:', remoteSettings);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }

      // Listen for settings updates
      const handleSettingsUpdate = (event: CustomEvent) => {
        console.log('Settings updated event:', event.detail);
        setSettings(event.detail);
      };

      window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);

      // 2. Restore and Validate Session
      const savedSession = localStorage.getItem('literasi_session');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);

          if (session.type === 'admin') {
            setLoggedInUser('admin');
          } else if (session.type === 'user' && session.user) {
            // Verify if user still exists and is active
            try {
              const users = await db.fetchUsers();
              const latestUser = users.find(u => u.id === session.user.id);

              if (latestUser && latestUser.akunStatus === 'Aktif') {
                // Update session with latest data (e.g. photo, name changes)
                setLoggedInUser(latestUser);
                // Update localStorage to keep it fresh
                localStorage.setItem('literasi_session', JSON.stringify({ type: 'user', user: latestUser }));
              } else {
                // User blocked or deleted
                console.warn("User session invalid or account inactive. Logging out.");
                setLoggedInUser(null);
                localStorage.removeItem('literasi_session');
                toast.error("Sesi anda telah berakhir atau akun dinonaktifkan oleh admin.");
              }
            } catch (err) {
              console.error("Error validating user session:", err);
              // If DB fetch fails, fallback to stored session? 
              // Better to allow access if it's just a network error, but for local-first/db.ts validation...
              // In this app, db.fetchUsers() is reliable for localStorage. 
              // We'll trust the stored session if DB fails (e.g. Supabase down), 
              // but purely local usage shouldn't fail here.
              setLoggedInUser(session.user);
            }
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem('literasi_session');
        }
      }
    };

    initializeApp();
  }, []);

  const handleLogin = useCallback(async (username: string, pass: string): Promise<boolean> => {
    // Admin login
    if (username === 'admin') {
      // Load settings fresh from database to ensure we have the latest password
      try {
        const currentSettings = await db.fetchSettings();
        // Update local settings state
        setSettings(currentSettings);

        // Verify password against database settings
        if (pass === currentSettings.adminPassword) {
          setLoggedInUser('admin');
          // Save admin session to localStorage
          localStorage.setItem('literasi_session', JSON.stringify({ type: 'admin' }));
          toast.success("Login berhasil! Selamat datang Admin.");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error loading settings for login:", error);
        // Fallback to current settings state if database fails
        if (pass === settings.adminPassword) {
          setLoggedInUser('admin');
          localStorage.setItem('literasi_session', JSON.stringify({ type: 'admin' }));
          toast.success("Login berhasil! Selamat datang Admin.");
          return true;
        }
        return false;
      }
    }

    // User login
    try {
      const users = await db.fetchUsers();
      const user = users.find(u => u.username === username && u.password === pass);
      if (user && user.akunStatus === 'Aktif') {
        setLoggedInUser(user);
        // Save user session to localStorage
        localStorage.setItem('literasi_session', JSON.stringify({ type: 'user', user }));
        toast.success(`Selamat datang, ${user.namaLengkap}!`);
        return true;
      }
    } catch (error) {
      console.error("Login error:", error);
    }
    return false;
  }, [settings]);

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
    // Clear session from localStorage
    localStorage.removeItem('literasi_session');
    toast.success("Logout berhasil.");
  }, []);

  const handleRegister = async (newUser: Omit<User, 'id' | 'akunStatus'>) => {
    await db.addUser({ ...newUser, akunStatus: 'Tidak aktif' });
    toast.success("Registrasi berhasil! Silakan hubungi admin untuk aktivasi akun.");
  };

  const renderContent = () => {
    // If user is logged in, show dashboard
    if (loggedInUser) {
      if (loggedInUser === 'admin') {
        return (
          <Suspense fallback={<Loading message="Memuat dashboard admin..." />}>
            <DashboardPage
              onLogout={handleLogout}
              settings={settings}
            />
          </Suspense>
        );
      }
      // It's a regular user
      return (
        <Suspense fallback={<Loading message="Memuat dashboard..." />}>
          <UserDashboardPage
            user={loggedInUser}
            onLogout={handleLogout}
            onUpdateUser={(updatedUser) => {
              // Update local state if current user is updated
              if (updatedUser.id === loggedInUser.id) {
                setLoggedInUser(updatedUser);
              }
            }}
            settings={settings}
          />
        </Suspense>
      );
    }

    // If not logged in, show landing page or login page
    if (showLogin) {
      return <LoginPage onLogin={handleLogin} onRegister={handleRegister} settings={settings} onBack={() => setShowLogin(false)} />;
    }

    // Default: show landing page
    return <LandingPage onLoginClick={() => setShowLogin(true)} settings={settings} />;
  }

  return (
    <div className="antialiased">
      <Toaster position="top-center" reverseOrder={false} />
      {renderContent()}
    </div>
  );
};

export default App;