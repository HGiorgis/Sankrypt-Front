import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import { CryptoService, Credential } from '../../utils/crypto/encryption';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface EditCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: Credential;
  onCredentialUpdated: () => void;
  masterKey: string;
}

const EditCredentialModal: React.FC<EditCredentialModalProps> = ({
  isOpen,
  onClose,
  credential,
  onCredentialUpdated,
  masterKey
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: credential.category,
    username: credential.username,
    password: credential.password,
    url: credential.url || '',
    notes: credential.notes || ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (credential) {
      setFormData({
        category: credential.category,
        username: credential.username,
        password: credential.password,
        url: credential.url || '',
        notes: credential.notes || ''
      });
    }
  }, [credential]);

  const categories = [
    { value: 'email', label: '📧 Email Account' },
    { value: 'developer', label: '💻 Developer Platform' },
    { value: 'cybersecurity', label: '🛡️ Cybersecurity Platform' },
    { value: 'social', label: '👥 Social Account' },
    { value: 'freelance', label: '💼 Freelance Platform' }
  ];

  const generatePassword = () => {
    const newPassword = CryptoService.generatePassword(20);
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.username || !formData.password) {
        setError('Username and password are required');
        return;
      }

      if (!masterKey || !user) {
        setError('Master key required for encryption');
        return;
      }

      // Create updated credential object
      const updatedCredential: Credential = {
        username: formData.username,
        password: formData.password,
        url: formData.url,
        notes: formData.notes,
        category: formData.category
      };

      // Encrypt the updated credential data with user's master key
      const encryptedData = await CryptoService.encryptData([updatedCredential], masterKey, user.email);
      const dataHash = CryptoService.createHash(encryptedData.data + encryptedData.salt);

      // Update in backend
      if (credential.id) {
        await apiService.updateVaultItem(credential.id, {
          encrypted_data: encryptedData.data,
          encryption_salt: encryptedData.salt, 
          data_hash: dataHash
        });

        onCredentialUpdated();
        onClose();
      }

    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Failed to update credential');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Credential</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Username/Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username or email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(formData.password)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Copy password"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Generate password"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL (Optional)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Security Notice</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• This credential will be encrypted with your master key</li>
              <li>• The updated data is secured before being sent to our servers</li>
              <li>• We never see your unencrypted credentials</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Credential'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCredentialModal;