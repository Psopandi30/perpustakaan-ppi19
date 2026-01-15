import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, BookOpenIcon } from './icons/Icons';
import RegistrationModal from './RegistrationModal';
import type { User, Settings } from '../types';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  onRegister: (user: Omit<User, 'id' | 'akunStatus'>) => void;
  settings: Settings;
  onBack?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister, settings, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-teal p-4">
        <div className="w-full max-w-sm mx-auto text-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 text-white hover:text-brand-yellow transition-colors text-sm"
            >
              ← Kembali ke Halaman Utama
            </button>
          )}
          <div className="mx-auto mb-8 w-32 h-32 flex items-center justify-center">
            {settings.loginLogo ? (
              <img
                src={settings.loginLogo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <BookOpenIcon className="h-20 w-20 text-brand-yellow" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-brand-yellow tracking-wider">LITERASI MEMBACA</h1>
          <p className="text-sm text-white mt-2">{settings.libraryName}</p>

          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              placeholder="Username"
              aria-label="Username"
              className="w-full px-6 py-3 text-gray-700 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Password"
                aria-label="Password"
                className="w-full px-6 py-3 text-gray-700 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center -mt-2" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 font-bold text-dark-teal bg-brand-yellow rounded-full hover:bg-yellow-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              Login
            </button>
          </form>

          <p className="mt-8 text-sm text-white">
            Belum punya akun login!!{' '}
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="font-bold text-brand-yellow hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-teal focus-visible:ring-brand-yellow rounded-sm"
            >
              Klik disini
            </button>
          </p>

          <p className="mt-8 text-xs text-white text-center">
            Development by Pendi Sopandi , S. Kom, ITS
          </p>
        </div>
      </div>
      {isRegisterModalOpen && (
        <RegistrationModal
          onClose={() => setIsRegisterModalOpen(false)}
          onSave={onRegister}
        />
      )}
    </>
  );
};

export default LoginPage;
