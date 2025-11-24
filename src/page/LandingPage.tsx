import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Key, Zap, Download, Chrome, Blocks,WindArrowDown,Apple, Github, Star, ArrowRight, Check, Sparkles, Eye, Cpu, Cloud, Smartphone, Server, Globe, ShieldCheck, Brain, Fingerprint, Database, Code, Terminal, Users, Rocket, User, ChevronDown, LogOut, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);   

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };  

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const features = [
    {
      icon: Lock,
      title: "Zero-Knowledge Architecture",
      description: "Your data is encrypted before it leaves your device. We never see your passwords or have access to your vault.",
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Quantum-Resistant Encryption",
      description: "Military-grade AES-256 encryption combined with advanced cryptographic protocols future-proof your security.",
      color: "from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      icon: Cloud,
      title: "Secure Multi-Device Sync",
      description: "Seamlessly sync across all your devices with end-to-end encryption. Your data is always available, always secure.",
      color: "from-green-500 to-emerald-500",
      gradient: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    {
      icon: Cpu,
      title: "Advanced Threat Protection",
      description: "Real-time monitoring and advanced heuristics protect against emerging threats and unauthorized access attempts.",
      color: "from-orange-500 to-red-500",
      gradient: "bg-gradient-to-r from-orange-500 to-red-500"
    }
  ];

  const advancedFeatures = [
    { icon: Brain, title: "AI-Powered Security", description: "Machine learning algorithms detect unusual patterns" },
    { icon: Fingerprint, title: "Biometric Integration", description: "Support for fingerprint and face recognition" },
    { icon: Database, title: "Secure Backup", description: "Automated encrypted backups to secure cloud storage" },
    { icon: Server, title: "Self-Hosting", description: "Optional self-hosting for complete control" },
    { icon: Code, title: "Developer API", description: "RESTful API for integration with your applications" },
    { icon: Terminal, title: "CLI Access", description: "Command-line interface for power users" }
  ];

  const browsers = [
    { name: "Chrome", icon: Chrome, comingSoon: false, users: "20+", link:"https://chromewebstore.google.com/detail/lastpass-free-password-ma/hdokiejnpimakedhajhdlcegeplioahd?hl=en" },
    { name: "Firefox", icon: Blocks, comingSoon: false, users: "80+",link:"https://addons.mozilla.org/en-US/firefox/addon/sankrypt/" },
    { name: "Edge", icon: WindArrowDown, comingSoon: true, users: "Coming Soon" },
    { name: "Safari", icon: Apple, comingSoon: true, users: "Coming Soon" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3 group">
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
                <p className="text-green-600/70 text-sm font-medium">Start Now</p>
              </div>
            </Link>
            
            {/* Conditional Navigation - Show user menu if authenticated, otherwise show auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/75 py-2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200/50">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/vault"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                          <span>My Vault</span>
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200/50 pt-2">
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogOut className="h-4 w-4" />
                          )}
                          <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl px-6 py-3 mb-12 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4].map((star) => (
                  <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">Rated 4.5/5 by security experts</span>
              <Sparkles className="h-4 w-4 text-purple-500" />
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-blue-700 to-purple-600 bg-clip-text text-transparent">
                Digital Security
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Enterprise-grade password management with quantum-resistant encryption. 
              Your secrets are secured with zero-knowledge architecture—we never see your data, 
              and neither does anyone else.
            </p>

            {/* CTA Buttons - Conditionally show different buttons based on authentication */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/vault"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-4 border border-purple-500/30 shadow-xl"
                  >
                    <Shield className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span>Access My Vault</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                  
                  <Link 
                    to="/settings"
                    className="group border border-gray-300 bg-white/80 backdrop-blur-xl text-gray-700 hover:text-gray-900 px-10 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-300 transform hover:scale-105 flex items-center space-x-4 shadow-lg"
                  >
                    <Settings className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span>Manage Settings</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/register"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 flex items-center space-x-4 border border-purple-500/30 shadow-xl"
                  >
                    <Rocket className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span>Launch Secure Vault</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                  
                  <button className="group border border-gray-300 bg-white/80 backdrop-blur-xl text-gray-700 hover:text-gray-900 px-10 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-300 transform hover:scale-105 flex items-center space-x-4 shadow-lg">
                    <Github className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span>Star on GitHub</span>
                  </button>
                </>
              )}
            </div>

            {/* Security Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { value: "AES-256", label: "Encryption", icon: ShieldCheck },
                { value: "Zero", label: "Knowledge", icon: Brain },
                { value: "95.99%", label: "Uptime", icon: Server },
                { value: "1K+", label: "Secrets", icon: Database }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl mb-4 group-hover:bg-blue-50 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="relative z-20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Built for <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Security Professionals</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced features designed for those who take security seriously
            </p>
          </div>

          {/* Main Feature Showcase */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`group p-8 rounded-3xl transition-all duration-700 cursor-pointer border ${
                    activeFeature === index 
                      ? 'bg-white shadow-2xl border-blue-300 transform scale-105' 
                      : 'bg-white/60 backdrop-blur-sm border-gray-200/50 hover:border-blue-200'
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-6">
                    <div className={`p-4 rounded-2xl ${feature.gradient} shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Demo */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl p-8 backdrop-blur-xl border border-blue-200/30 shadow-2xl">
                <div className="bg-white rounded-2xl shadow-inner p-6 border border-gray-200/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="flex-1 text-center">
                      <span className="text-sm font-semibold text-gray-700">Sankrypt Vault</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200/50">
                      <Key className="h-6 w-6 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Master Password</div>
                        <div className="text-xs text-gray-500">••••••••••••</div>
                      </div>
                      <Eye className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {['Banking', 'Email', 'Social', 'Work'].map((item, index) => (
                        <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl text-center border border-blue-200/50 hover:border-purple-300 transition-colors">
                          <div className="text-sm font-semibold text-gray-900">{item}</div>
                          <div className="text-xs text-blue-600">Secured</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">All systems secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Security Elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-blue-500 rounded-full shadow-2xl animate-bounce border border-blue-400/50"></div>
              <div className="absolute -bottom-6 -left-6 w-10 h-10 bg-purple-500 rounded-full shadow-2xl animate-pulse border border-purple-400/50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Browser Extension Section */}
      <section className="relative z-20 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white/50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Browser Extension</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Auto-fill passwords securely across all your favorite websites with our privacy-first browser extension
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="grid gap-4">
                {[
                  "Instant auto-fill for login forms",
                  "One-click strong password generation",
                  "Secure password capture and storage",
                  "Cross-browser compatibility",
                  "Advanced form detection AI",
                  "Zero-knowledge local encryption"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-green-300 transition-all duration-300 hover:scale-105">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link 
                  to="https://addons.mozilla.org/en-US/firefox/addon/sankrypt/"
                  className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 border border-green-500/30 shadow-lg"
                >
                  <Download className="h-5 w-5" />
                  <span>Install Extension</span>
                </Link>
                <button className="inline-flex items-center justify-center space-x-3 border border-gray-300 bg-white/80 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <Users className="h-5 w-5" />
                  <span>View Demo</span>
                </button>
              </div>
            </div>

            {/* Browser Cards */}
            <div className="grid grid-cols-2 gap-6">
              {browsers.map((browser, index) => (
                <div 
                  key={index}
                  className={`group p-8 rounded-3xl text-center transition-all duration-500 shadow-xl ${
                    browser.comingSoon 
                      ? 'bg-white/60 border border-gray-200/50' 
                      : 'bg-white border border-gray-200/50 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-105'
                  }`}
                >
                  <div className="flex justify-center mb-6">
                    <div className={`p-5 rounded-2xl shadow-lg ${
                      browser.comingSoon 
                        ? 'bg-gray-200' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-400 group-hover:to-purple-500'
                    } group-hover:scale-110 transition-transform duration-300`}>
                      <browser.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{browser.name}</h3>
                  <div className={`text-sm mb-4 ${
                    browser.comingSoon ? 'text-gray-500' : 'text-blue-600'
                  }`}>
                    {browser.users}
                  </div>
                  {browser.comingSoon ? (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Coming Soon</span>
                  ) : (
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm">
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-20 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl p-16 backdrop-blur-2xl border border-blue-200/30 shadow-2xl">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              {isAuthenticated ? 'Welcome Back to Your Secure Vault' : 'Ready to Fortify Your Digital Life?'}
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {isAuthenticated 
                ? 'Your encrypted vault is ready and waiting. Access your passwords, secure notes, and digital assets with military-grade protection.'
                : 'Join millions of security-conscious users and enterprises who trust Sankrypt with their most sensitive data. Experience peace of mind with military-grade encryption.'
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/vault"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-12 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 border border-purple-500/30 shadow-xl"
                  >
                    Open My Vault
                  </Link>
                  <Link 
                    to="/settings"
                    className="border border-gray-300 bg-white/80 text-gray-700 hover:text-gray-900 hover:border-blue-300 px-12 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Account Settings
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-12 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 border border-purple-500/30 shadow-xl"
                  >
                    Create Free Account
                  </Link>
                  <Link 
                    to="/login"
                    className="border border-gray-300 bg-white/80 text-gray-700 hover:text-gray-900 hover:border-blue-300 px-12 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Sign In to Vault
                  </Link>
                </>
              )}
            </div>
            {!isAuthenticated && (
              <p className="text-gray-500 text-sm mt-6">
                No credit card required • 30-day free trial • Setup in 2 minutes
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200/50 bg-white/80 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link to="/" className="flex items-center space-x-3 group">
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
              </div>
            </Link>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>© 2025 Sankrypt. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;