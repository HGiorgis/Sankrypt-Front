import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Header from './components/Layout/Header';
import VaultDashboard from './components/Vault/VaultDashboard';
import SettingsPage from './components/Settings/SettingsPage';
import LandingPage from './page/LandingPage';
import { Lock, Shield, Key, Cpu } from 'lucide-react';
import './index.css';

// Beautiful Hash Word Loading Component
const HashLoading: React.FC = () => {
  const [currentHash, setCurrentHash] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  const hashWords = ['ENCRYPTING', 'SECURING', 'PROTECTING', 'VALIDATING'];
  const securityIcons = [Shield, Lock, Key, Cpu];

  useEffect(() => {
    const hashInterval = setInterval(() => {
      setCurrentHash((prev) => (prev + 1) % hashWords.length);
    }, 2000);

    return () => clearInterval(hashInterval);
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    const targetText = hashWords[currentHash];
    setDisplayedText('');

    const typeInterval = setInterval(() => {
      if (currentIndex <= targetText.length) {
        setDisplayedText(targetText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentHash]);

  const CurrentIcon = securityIcons[currentHash];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 to-purple-50/30 flex items-center justify-center">
      <div className="text-center space-y-12">
        {/* Animated Logo Container */}
        <div className="relative">
          {/* Outer Spinning Ring */}
          <div className="w-24 h-24 border-2 border-blue-200/60 rounded-full animate-spin-slow mx-auto">
            {/* Inner Counter-spinning Ring */}
          </div>
          
          {/* Central Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3">
              <CurrentIcon className="w-8 h-8 text-blue-600 animate-soft-pulse" />
            </div>
          </div>

          {/* Floating Hash Elements */}
          <div className="absolute -top-4 -right-4 w-6 h-6 bg-blue-400/20 rounded-full animate-float-1 backdrop-blur-sm"></div>
          <div className="absolute -bottom-4 -left-4 w-5 h-5 bg-purple-400/20 rounded-full animate-float-2 backdrop-blur-sm"></div>
          <div className="absolute top-8 -right-8 w-4 h-4 bg-cyan-400/20 rounded-full animate-float-3 backdrop-blur-sm"></div>
          <div className="absolute -top-6 left-8 w-3 h-3 bg-indigo-400/20 rounded-full animate-float-4 backdrop-blur-sm"></div>
        </div>

        {/* Text Content */}
        <div className="space-y-6">
          {/* Brand */}
          <div className="space-y-2">
            <h1 className="text-3xl font-light text-gray-800 tracking-wide">Sankrypt</h1>
            <p className="text-sm text-gray-500 font-medium">Secure Vault System</p>
          </div>

          {/* Typing Hash Text */}
          <div className="h-8 flex items-center justify-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200/50 shadow-sm">
              <span className="text-lg font-mono text-blue-700 font-medium tracking-wider">
                {displayedText}
                <span className="animate-pulse-slow text-bold">|</span>
              </span>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            {hashWords.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-700 ${
                  index === currentHash 
                    ? 'bg-blue-500 scale-125 shadow-sm' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Subtle Status */}
          <p className="text-xs text-gray-400 font-light animate-fade-in-out">
            Preparing your encrypted environment...
          </p>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <HashLoading />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <HashLoading />;
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/vault" replace />;
};

const AppContent: React.FC = () => {
  const { logout, isLoading } = useAuth();

  useEffect(() => {
    const SESSION_TIMEOUT = 5 * 60 * 1000;
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [logout]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return <HashLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <PublicRoute>
            <LoginForm onShowRegister={() => window.location.href = '/register'} />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterForm onShowLogin={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute>
            <Header />
            <main>
              <VaultDashboard />
            </main>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Header />
            <main>
              <SettingsPage />
            </main>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;