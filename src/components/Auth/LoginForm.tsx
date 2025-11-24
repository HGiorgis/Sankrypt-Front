import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, UserPlus, Shield, Key, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CryptoService } from '../../utils/crypto/encryption';

interface LoginFormProps {
  onShowRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [floatingShapes, setFloatingShapes] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  
  const { login, isLoading: authLoading } = useAuth();

  // Generate floating shapes for background
  useEffect(() => {
    const shapes = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setFloatingShapes(shapes);
  }, []);

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [email, masterPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Basic client-side validation
    if (!email || !masterPassword) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (masterPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Create auth key hash using the same method as registration
      const dataToHash = masterPassword + email;
      const authKeyHash = CryptoService.createAuthHash(dataToHash);
      
      // Pass both the hash (for API) and plain password (for encryption)
      await login(email, authKeyHash, masterPassword);
      
    } catch (err: any) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.response?.status === 422) {
        errorMessage = 'Invalid input data. Please check your email format.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingShapes.map((shape) => (
          <div
            key={shape.id}
            className="absolute w-4 h-4 bg-blue-200/40 rounded-full animate-float"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              animationDelay: `${shape.delay}s`,
              animationDuration: `${15 + shape.id * 2}s`
            }}
          />
        ))}
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px),
                             linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 shadow-2xl shadow-blue-100/50 overflow-hidden">
          {/* Header Section */}
          <div className="relative p-8 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-b border-blue-100/50">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg opacity-60 animate-pulse"></div>
                <img 
                  src="/logo.png" 
                  alt="Sankrypt" 
                  className="relative w-16 h-16 rounded-full border-2 border-white shadow-lg"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Sankrypt
                </h1>
                <p className="text-blue-600/70 text-sm font-medium">Secure Vault</p>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm">
                Access your encrypted vault securely
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 backdrop-blur-sm animate-shake">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Email Input */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                    <Mail className="h-5 w-5 text-blue-500/70 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="Enter your email"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label htmlFor="masterPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                    <Key className="h-5 w-5 text-blue-500/70 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="masterPassword"
                    name="masterPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="Enter your master password"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-transform duration-200 hover:scale-110"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group relative w-full py-4 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 overflow-hidden"
                >
                  {/* Animated background effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 transition-transform duration-500 ${isHovered ? 'translate-x-0' : '-translate-x-full'}`} />
                  
                  {/* Button content */}
                  <div className="relative flex items-center justify-center">
                    {isSubmitDisabled ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Unlocking Vault...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                        Access Secure Vault
                        <Zap className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Security Features */}
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 pt-2">
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>End-to-End Encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Lock className="h-3 w-3" />
                  <span>Zero-Knowledge</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center pt-6 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={onShowRegister}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-all duration-200 transform hover:scale-105 group font-medium"
                >
                  <UserPlus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                  Create new secure vault
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500 flex items-center justify-center space-x-2">
            <Shield className="h-3 w-3" />
            <span>Your data is encrypted before it leaves your device</span>
          </p>
        </div>
      </div>

      {/* Add custom animations to global CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>  
  );
};

export default LoginForm;