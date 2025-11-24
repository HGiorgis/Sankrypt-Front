import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, UserPlus, Shield, Key, Zap, ArrowLeft, Check, X } from 'lucide-react';
import { CryptoService } from '../../utils/crypto/encryption';
import { apiService } from '../../services/api';

interface RegisterFormProps {
  onShowLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onShowLogin }) => {
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [floatingShapes, setFloatingShapes] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  
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

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }

    if (!masterPassword) {
      setError('Password is required');
      return false;
    }

    if (masterPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (masterPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // Create auth key hash
      const dataToHash = masterPassword + email;
      const authKeyHash = CryptoService.createAuthHash(dataToHash);

      // Call the registration API
      await apiService.register({
        email,
        auth_key_hash: authKeyHash
      });

      setSuccess('Registration successful! You can now login with your credentials.');
      
      // Clear form
      setEmail('');
      setMasterPassword('');
      setConfirmPassword('');

      // Show success message for 3 seconds then switch to login
      setTimeout(() => {
        onShowLogin();
      }, 3000);

    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.status === 429) {
        errorMessage = 'Too many registration attempts. Please wait a moment and try again.';
      } else if (err.response?.status === 422) {
        // Validation errors from backend
        const errors = err.response.data.details;
        if (errors.email) {
          errorMessage = `Email error: ${errors.email[0]}`;
        } else if (errors.auth_key_hash) {
          errorMessage = `Password error: ${errors.auth_key_hash[0]}`;
        } else {
          errorMessage = 'Please check your input and try again.';
        }
      } else if (err.response?.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = CryptoService.validatePasswordStrength(masterPassword);
  const passwordRequirements = [
    { text: 'At least 8 characters', met: masterPassword.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(masterPassword) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(masterPassword) },
    { text: 'Contains number', met: /[0-9]/.test(masterPassword) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(masterPassword) },
  ];

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
          <div className="relative p-8 bg-gradient-to-r from-green-500/5 to-blue-500/5 border-b border-blue-100/50">
             <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-lg opacity-60 animate-pulse"></div>
                <img 
                  src="/logo.png" 
                  alt="Sankrypt" 
                  className="relative w-16 h-16 rounded-full border-2 border-white shadow-lg"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-700 bg-clip-text text-transparent">
                  Sankrypt
                </h1>
                <p className="text-green-600/70 text-sm font-medium">Create Vault</p>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Vault
              </h2>
              <p className="text-gray-600 text-sm">
                Start securing your credentials with end-to-end encryption
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

              {success && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 backdrop-blur-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        {success}
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

              {/* Master Password Input */}
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
                    autoComplete="new-password"
                    required
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="Create a strong password"
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

                {/* Password Requirements */}
                {masterPassword && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">Password Strength</span>
                      <span className={`text-xs font-bold ${
                        passwordStrength.score >= 4 ? 'text-green-600' : 
                        passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.score >= 4 ? 'Strong' : 
                         passwordStrength.score >= 2 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          passwordStrength.score >= 4 ? 'bg-green-500' : 
                          passwordStrength.score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="space-y-1 mt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          {req.met ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-gray-400" />
                          )}
                          <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                    <Lock className="h-5 w-5 text-blue-500/70 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-12 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                      confirmPassword && masterPassword !== confirmPassword 
                        ? 'border-red-300' 
                        : 'border-gray-200'
                    }`}
                    placeholder="Confirm your password"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-transform duration-200 hover:scale-110"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {confirmPassword && masterPassword !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-2 flex items-center">
                    <X className="h-3 w-3 mr-1" />
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && masterPassword === confirmPassword && (
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-medium text-blue-800">Security Notice</h4>
                </div>
                <ul className="text-xs text-blue-700/80 space-y-1">
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>Your master password encrypts all your data locally</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>We never see your password or unencrypted data</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>Remember your password - it cannot be recovered</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>Use a strong, unique password you don't use elsewhere</span>
                  </li>
                </ul>
              </div>

              {/* Register Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group relative w-full py-4 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/25 hover:shadow-green-500/40 overflow-hidden"
                >
                  {/* Animated background effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 transition-transform duration-500 ${isHovered ? 'translate-x-0' : '-translate-x-full'}`} />
                  
                  {/* Button content */}
                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Secure Vault...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                        Create Secure Vault
                        <Zap className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-6 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={onShowLogin}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-all duration-200 transform hover:scale-105 group font-medium"
                >
                  Already have an account? Sign in
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

export default RegisterForm;