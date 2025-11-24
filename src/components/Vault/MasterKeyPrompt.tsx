  import React, { useState } from 'react';
  import { Lock, Eye, EyeOff, X } from 'lucide-react';

  interface MasterKeyPromptProps {
    isOpen: boolean;
    onSubmit: (masterKey: string) => Promise<void>;
    onCancel: () => void;
  }

  const MasterKeyPrompt: React.FC<MasterKeyPromptProps> = ({
    isOpen,
    onSubmit,
    onCancel
  }) => {
    const [masterKey, setMasterKey] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!masterKey.trim()) {
        setError('Master key is required');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        await onSubmit(masterKey);
        setMasterKey('');
      } catch (err: any) {
        setError(err.message || 'Invalid master key');
      } finally {
        setIsLoading(false);
      }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Unlock Your Vault</h2>
            </div>
            <button
              onClick={onCancel}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Master Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="Your master key..."
                  className="w-full border border-gray-300 rounded-md px-3 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Security Notice</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Your master key is never stored on our servers</li>
                <li>• It's only kept in your browser's memory temporarily</li>
                <li>• All encryption/decryption happens locally in your browser</li>
                <li>• The key will be cleared when you logout or close the tab</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  'Unlock Vault'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default MasterKeyPrompt;