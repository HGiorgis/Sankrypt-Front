import React, { useState } from 'react';
import { X, Eye, EyeOff, Copy, RefreshCw, Lock } from 'lucide-react';
import { CryptoService, Credential } from '../../utils/crypto/encryption';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import MasterKeyPrompt from './MasterKeyPrompt';

interface AddCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialAdded: () => void;
  masterKey: string;
}

const AddCredentialModal: React.FC<AddCredentialModalProps> = ({
  isOpen,
  onClose,
  onCredentialAdded,
  masterKey
}) => {
  const { user, temporaryMasterKey, setTemporaryMasterKey } = useAuth();
  const [formData, setFormData] = useState({
    category: 'email',
    username: '',
    password: '',
    url: '',
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showMasterKeyPrompt, setShowMasterKeyPrompt] = useState(false);
  const [isVerifyingMasterKey, setIsVerifyingMasterKey] = useState(false);

  const categories = [
    { value: 'email', label: '📧 Email Account' },
    { value: 'developer', label: '💻 Developer Platform' },
    { value: 'cybersecurity', label: '🛡️ Cybersecurity Platform' },
    { value: 'social', label: '👥 Social Account' },
    { value: 'freelance', label: '💼 Freelance Platform' }
  ];

  // Get current master key from props or temporary storage
  const getCurrentMasterKey = (): string => {
    return masterKey || temporaryMasterKey || '';
  };

  const generatePassword = () => {
    const newPassword = CryptoService.generatePassword(20);
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleMasterKeySubmit = async (enteredMasterKey: string) => {
    setIsVerifyingMasterKey(true);
    try {
       const credential: Credential = {
        username: formData.username,
        password: formData.password,
        url: formData.url,
        notes: formData.notes,
        category: formData.category
      };
      const encrypted = await CryptoService.encryptData([credential], enteredMasterKey, user!.email);
      await CryptoService.decryptData(encrypted, enteredMasterKey, user!.email);
      
      // Store in temporary memory
      setTemporaryMasterKey(enteredMasterKey);
      setShowMasterKeyPrompt(false);
      setIsVerifyingMasterKey(false);
    } catch (error) {
      setIsVerifyingMasterKey(false);
      throw new Error('Invalid master key. Please try again.');
    }
  };

  const handleMasterKeyCancel = () => {
    setShowMasterKeyPrompt(false);
    onClose(); // Close the modal if user cancels master key entry
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if master key is available
    const currentMasterKey = getCurrentMasterKey();
    if (!currentMasterKey) {
      setShowMasterKeyPrompt(true);
      return;
    }

    setIsLoading(true);
    setError('');
    setDebugInfo('');

    try {
      // Validate form
      if (!formData.username || !formData.password) {
        setError('Username and password are required');
        return;
      }

      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Create credential object
      const credential: Credential = {
        username: formData.username,
        password: formData.password,
        url: formData.url,
        notes: formData.notes,
        category: formData.category
      };

      setDebugInfo('Starting encryption...');

      // Encrypt with user's master key and email
      const encryptedData = await CryptoService.encryptData([credential], currentMasterKey, user.email);
      
      setDebugInfo(`Encryption successful. Data length: ${encryptedData.data.length}, Salt: ${encryptedData.salt}`);

      const dataHash = CryptoService.createHash(encryptedData.data + encryptedData.salt);

      setDebugInfo(`Data hash created: ${dataHash}`);

      // Prepare the request payload
      const payload = {
        category: formData.category,
        encrypted_data: encryptedData.data,
        encryption_salt: encryptedData.salt, 
        data_hash: dataHash
      };

      setDebugInfo(`Sending payload: ${JSON.stringify({
        category: formData.category,
        encrypted_data_length: encryptedData.data.length,
        data_hash_length: dataHash.length
      })}`);

      // Send to backend
      await apiService.createVaultItem(payload);

      setDebugInfo('Credential added successfully');

      // Clear form and close
      setFormData({
        category: 'email',
        username: '',
        password: '',
        url: '',
        notes: ''
      });
      
      onCredentialAdded();
      onClose();

    } catch (err: any) {
      console.error('Add credential error:', err);
      
      let errorMessage = 'Failed to add credential';
      
      if (err.response) {
        const { status, data } = err.response;
        
        errorMessage = `Request failed with status ${status}`;
        
        if (status === 422) {
          errorMessage = 'Validation error: ';
          if (data.details) {
            Object.keys(data.details).forEach(key => {
              errorMessage += `${key}: ${data.details[key].join(', ')} `;
            });
          } else if (data.message) {
            errorMessage += data.message;
          } else if (data.error) {
            errorMessage += data.error;
          }
        } else if (status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        setDebugInfo(`Response data: ${JSON.stringify(data)}`);
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
        setDebugInfo('No response received from server');
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Show master key prompt if needed
  if (showMasterKeyPrompt) {
    return (
      <MasterKeyPrompt
        isOpen={showMasterKeyPrompt}
        onSubmit={handleMasterKeySubmit}
        onCancel={handleMasterKeyCancel}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Credential</h2>
              <p className="text-sm text-gray-500">
                {getCurrentMasterKey() ? '🔓 Vault unlocked' : '🔒 Vault locked - enter master key'}
              </p>
            </div>
          </div>
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
              <div className="text-sm text-red-700 font-medium mb-2">{error}</div>
              {debugInfo && (
                <details className="text-xs text-red-600 mt-2">
                  <summary className="cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
                </details>
              )}
            </div>
          )}

          {/* Master Key Warning */}
          {!getCurrentMasterKey() && (
            <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Master Key Required</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You need to enter your master key to encrypt this credential.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMasterKeyPrompt(true)}
                className="mt-2 w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
              >
                Enter Master Key
              </button>
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
              disabled={!getCurrentMasterKey()}
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
              disabled={!getCurrentMasterKey()}
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
                disabled={!getCurrentMasterKey()}
              />
              <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(formData.password)}
                  className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy password"
                  disabled={!getCurrentMasterKey()}
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate password"
                  disabled={!getCurrentMasterKey()}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  disabled={!getCurrentMasterKey()}
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
              disabled={!getCurrentMasterKey()}
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
              disabled={!getCurrentMasterKey()}
            />
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
              disabled={isLoading || !getCurrentMasterKey()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Credential'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCredentialModal;