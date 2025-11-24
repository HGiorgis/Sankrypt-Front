import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2, ExternalLink, Check, Globe, User, Lock, Calendar, FileText } from 'lucide-react';
import { Credential } from '../../utils/crypto/encryption';

interface CredentialItemProps {
  credential: Credential;
  onEdit: (credential: Credential) => void;
  onDelete: (credential: Credential) => void;
}

const CredentialItem: React.FC<CredentialItemProps> = ({
  credential,
  onEdit,
  onDelete
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWebsiteClick = () => {
    if (credential.url) {
      window.open(credential.url.startsWith('http') ? credential.url : `https://${credential.url}`, '_blank');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      email: 'from-blue-500 to-cyan-500',
      developer: 'from-purple-500 to-pink-500',
      cybersecurity: 'from-green-500 to-emerald-500',
      social: 'from-orange-500 to-red-500',
      freelance: 'from-indigo-500 to-purple-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      email: '📧',
      developer: '💻',
      cybersecurity: '🛡️',
      social: '👥',
      freelance: '💼'
    };
    return icons[category as keyof typeof icons] || '🔐';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 hover:border-blue-300/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm">
      {/* Header with Gradient */}
      <div className={`bg-gradient-to-r ${getCategoryColor(credential.category)} rounded-t-2xl p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getCategoryIcon(credential.category)}</div>
            <div>
              <h3 className="font-semibold text-white text-lg capitalize">
                {credential.category.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <p className="text-blue-100 text-sm opacity-90">
                {/* Added {formatDate(credential.createdAt)} */}
              </p>
            </div>
          </div>
          {credential.url && (
            <button
              onClick={handleWebsiteClick}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 transform hover:scale-110"
              title="Visit website"
            >
              <Globe className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Username Field */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>Username / Email</span>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 group-hover:bg-gray-100 transition-colors">
            <span className="font-medium text-gray-900 truncate">
              {credential.username}
            </span>
            <button
              onClick={() => copyToClipboard(credential.username, 'username')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-blue-700"
            >
              {copiedField === 'username' ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Lock className="h-4 w-4" />
            <span>Password</span>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 group-hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3 flex-1">
              <span className="font-mono text-gray-900">
                {showPassword ? credential.password : '•'.repeat(16)}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            <button
              onClick={() => copyToClipboard(credential.password, 'password')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-blue-700 ml-2"
            >
              {copiedField === 'password' ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notes Field */}
        {credential.notes && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>Notes</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 group-hover:bg-gray-100 transition-colors">
              <p className="text-gray-700 text-sm leading-relaxed">
                {credential.notes}
              </p>
            </div>
          </div>
        )}

        {/* Last Accessed */}
        {credential.lastAccessed && (
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>Last accessed {formatDate(credential.lastAccessed)}</span>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200/50 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(credential)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm shadow-sm"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(credential)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 transform hover:scale-105 font-medium text-sm shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialItem;