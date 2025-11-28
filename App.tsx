import React, { useState, useCallback, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import UserDashboardPage from './components/UserDashboardPage';
import type { User, Settings } from './types';
import * as db from './db';

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | 'admin' | null>(null);
  const [settings, setSettings] = useState<Settings>({
    libraryName: '',
    adminPassword: '',
    loginLogo: '',
    adminPhoto: ''
  });

  // Load settings and restore login session on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const remoteSettings = await db.fetchSettings();
        if (remoteSettings) {
          setSettings(remoteSettings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();

    // Restore login session from localStorage
    const savedSession = localStorage.getItem('literasi_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.type === 'admin') {
          setLoggedInUser('admin');
        } else if (session.type === 'user' && session.user) {
          setLoggedInUser(session.user);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem('literasi_session');
      }
    }
  }, []);

  const handleLogin = useCallback(async (username: string, pass: string): Promise<boolean> => {
    // Admin login
    if (username === 'admin') {
      // We use the settings loaded from DB (or initial state)
      if (pass === settings.adminPassword) {
        setLoggedInUser('admin');
        // Save admin session to localStorage
        localStorage.setItem('literasi_session', JSON.stringify({ type: 'admin' }));
        return true;
      }
      return false;
    }

    // User login
    try {
      const users = await db.fetchUsers();
      const user = users.find(u => u.username === username && u.password === pass);
      if (user && user.akunStatus === 'Aktif') {
        setLoggedInUser(user);
        // Save user session to localStorage
        localStorage.setItem('literasi_session', JSON.stringify({ type: 'user', user }));
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
  }, []);

  const handleRegister = async (newUser: Omit<User, 'id' | 'akunStatus'>) => {
    await db.addUser(newUser);
    alert("Registrasi berhasil! Silakan hubungi admin untuk aktivasi akun.");
  };

  const renderContent = () => {
    if (!loggedInUser) {
      return <LoginPage onLogin={handleLogin} onRegister={handleRegister} settings={settings} />;
    }
    if (loggedInUser === 'admin') {
      return (
        <DashboardPage
          onLogout={handleLogout}
          settings={settings}
        />
      );
    }
    // It's a regular user
    return (
      <UserDashboardPage
        user={loggedInUser}
        onLogout={handleLogout}
        onUpdateUser={(updatedUser) => {
          // Update local state if current user is updated
          if (updatedUser.id === loggedInUser.id) {
            setLoggedInUser(updatedUser);
          }
        }}
      />
    );
  }

  return (
    <div className="antialiased">
      {renderContent()}
    </div>
  );
};

export default App;