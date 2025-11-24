import React, { useState } from 'react';
import { Key, Eye, EyeOff, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CryptoService } from '../../utils/crypto/encryption';
import { apiService } from '../../services/api';

const ChangeMasterKey: React.FC = () => {
  const { user, logout, setTemporaryMasterKey } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentMasterKey, setCurrentMasterKey] = useState('');
  const [newMasterKey, setNewMasterKey] = useState('');
  const [confirmMasterKey, setConfirmMasterKey] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showCurrentMasterKey, setShowCurrentMasterKey] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!currentPassword) {
      setError('Current password is required');
      return false;
    }

    if (!currentMasterKey) {
      setError('Current master key is required');
      return false;
    }

    if (!newMasterKey) {
      setError('New master key is required');
      return false;
    }

    if (newMasterKey.length < 8) {
      setError('New master key must be at least 8 characters long');
      return false;
    }

    if (newMasterKey !== confirmMasterKey) {
      setError('New master keys do not match');
      return false;
    }

    const strength = CryptoService.validatePasswordStrength(newMasterKey);
    if (!strength.isValid) {
      setError(`Weak master key: ${strength.feedback[0]}`);
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
        return;
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Step 1: Verify current password
      const currentAuthHash = CryptoService.createAuthHash(currentPassword + user.email);
      try {
        await apiService.login({
          email: user.email,
          auth_key_hash: currentAuthHash
        });
      } catch (loginError: any) {
        if (loginError.response?.status === 401 || loginError.response?.status === 422) {
          throw new Error('Current password is incorrect');
        }
        throw loginError;
      }

      // Step 2: Verify current master key by trying to decrypt existing vault items
      const vaultsResponse = await apiService.getVaults();
      let currentMasterKeyValid = false;
      
      if (vaultsResponse.vaults.length > 0) {
        try {
          const testVault = await apiService.getVaultItem(vaultsResponse.vaults[0].id);
          const encryptedData = {
            data: testVault.vault.encrypted_data,
            salt: testVault.vault.encryption_salt,
            version: testVault.vault.version || '1.0'
          };

          await CryptoService.decryptData(encryptedData, currentMasterKey, user.email);
          currentMasterKeyValid = true;
        } catch (decryptError) {
          throw new Error('Current master key is incorrect');
        }
      } else {
        // If no vaults exist, we can't verify the master key through decryption
        // So we'll proceed and trust the user knows their current master key
        currentMasterKeyValid = true;
      }

      if (!currentMasterKeyValid) {
        throw new Error('Current master key is incorrect');
      }

      // Step 3: Re-encrypt all vault items with new master key
      const reencryptedVaults = [];

      for (const vault of vaultsResponse.vaults) {
        try {
          const vaultDetail = await apiService.getVaultItem(vault.id);
          const encryptedData = {
            data: vaultDetail.vault.encrypted_data,
            salt: vaultDetail.vault.encryption_salt,
            version: vaultDetail.vault.version || '1.0'
          };

          console.log('🔐 Decrypting vault for re-encryption:', vault.id);
          console.log('Encrypted data length:', encryptedData.data.length);
          console.log('Salt length:', encryptedData.salt.length);

          // Decrypt with old master key
          const decrypted = await CryptoService.decryptData(encryptedData, currentMasterKey, user.email);
          
          console.log('✅ Decrypted data:', decrypted);
          
          // Validate decrypted data structure
          if (!decrypted || !Array.isArray(decrypted) || decrypted.length === 0) {
            throw new Error('Decrypted data is invalid or empty');
          }

          // Re-encrypt with new master key
          console.log('🔐 Re-encrypting with new master key...');
          const newEncryptedData = await CryptoService.encryptData(decrypted, newMasterKey, user.email);
          
          console.log('✅ New encrypted data length:', newEncryptedData.data.length);
          console.log('✅ New salt length:', newEncryptedData.salt.length);

          const newDataHash = CryptoService.createHash(newEncryptedData.data + newEncryptedData.salt);

          reencryptedVaults.push({
            id: vault.id,
            encrypted_data: newEncryptedData.data,
            encryption_salt: newEncryptedData.salt,
            data_hash: newDataHash
          });
          
          console.log('✅ Successfully re-encrypted vault:', vault.id);
          
        } catch (vaultError) {
          console.error(`❌ Error processing vault ${vault.id}:`, vaultError);
          throw new Error(`Failed to process vault item ${vault.id}: ${vaultError instanceof Error ? vaultError.message : 'Unknown error'}`);
        }
      }

      // Step 4: Update all vault items with new encryption
      for (const vault of reencryptedVaults) {
        try {
          await apiService.updateVaultItem(vault.id, {
            encrypted_data: vault.encrypted_data,
            encryption_salt: vault.encryption_salt,
            data_hash: vault.data_hash
          });
        } catch (updateError: any) {
          // Handle 422 errors specifically
          if (updateError.response?.status === 422) {
            const errorData = updateError.response?.data;
            const validationErrors = errorData?.errors || errorData?.message;
            throw new Error(`Validation error: ${JSON.stringify(validationErrors)}`);
          }
          throw updateError;
        }
      }

      // Store new master key in secure memory temporarily
      setTemporaryMasterKey(newMasterKey);
      
      setSuccess('Master key changed successfully! All your credentials have been re-encrypted. You will be logged out in 3 seconds.');
      
      // Clear form
      setCurrentPassword('');
      setCurrentMasterKey('');
      setNewMasterKey('');
      setConfirmMasterKey('');

      // Force user to login again with new master key
      setTimeout(() => {
        logout();
      }, 3000);

    } catch (err: any) {
      console.error('Master key change error:', err);
      
      // Handle different error types
      if (err.message?.includes('Current password is incorrect') || 
          err.message?.includes('Current master key is incorrect') ||
          err.message?.includes('Decryption failed') || 
          err.message?.includes('Invalid master key')) {
        setError(err.message);
      } else if (err.response?.status === 422) {
        const errorData = err.response?.data;
        const validationErrors = errorData?.errors || errorData?.message || 'Validation failed';
        setError(`Server validation error: ${JSON.stringify(validationErrors)}`);
      } else {
        setError(err.message || 'Failed to change master key. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = CryptoService.validatePasswordStrength(newMasterKey);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-full">
          <Key className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Change Master Key</h2>
          <p className="text-gray-600">Update your encryption key for all stored credentials</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="text-sm text-green-700">{success}</div>
            </div>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isLoading}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Current Master Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Master Key
          </label>
          <div className="relative">
            <input
              type={showCurrentMasterKey ? 'text' : 'password'}
              value={currentMasterKey}
              onChange={(e) => setCurrentMasterKey(e.target.value)}
              placeholder="Enter current master key"
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowCurrentMasterKey(!showCurrentMasterKey)}
              disabled={isLoading}
            >
              {showCurrentMasterKey ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* New Master Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Master Key
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newMasterKey}
              onChange={(e) => setNewMasterKey(e.target.value)}
              placeholder="Enter new master key"
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowNew(!showNew)}
              disabled={isLoading}
            >
              {showNew ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {newMasterKey && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-1">
                <div className={`h-2 flex-1 rounded-full ${
                  passwordStrength.score >= 8 ? 'bg-green-500' : 
                  passwordStrength.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-500">
                  {passwordStrength.score >= 8 ? 'Strong' : 
                   passwordStrength.score >= 5 ? 'Medium' : 'Weak'}
                </span>
              </div>
              {!passwordStrength.isValid && (
                <p className="text-xs text-red-600">{passwordStrength.feedback[0]}</p>
              )}
            </div>
          )}
        </div>

        {/* Confirm Master Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Master Key
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmMasterKey}
              onChange={(e) => setConfirmMasterKey(e.target.value)}
              placeholder="Confirm new master key"
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={isLoading}
            >
              {showConfirm ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {confirmMasterKey && newMasterKey !== confirmMasterKey && (
            <p className="text-xs text-red-600 mt-1">Master keys do not match</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Important Security Notice</h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• You must verify both your password and current master key</li>
                <li>• All your existing credentials will be re-encrypted with the new master key</li>
                <li>• This process cannot be undone</li>
                <li>• You will be logged out after changing the master key</li>
                <li>• Make sure to remember your new master key - it cannot be recovered</li>
                <li>• The new master key is stored securely in memory during this session</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Changing Master Key...
              </div>
            ) : (
              'Change Master Key'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangeMasterKey;