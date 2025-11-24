import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Shield, Mail, Code, Users, Briefcase, Key, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { CryptoService, Credential } from '../../utils/crypto/encryption';
import AddCredentialModal from './AddCredentialModal';
import CredentialItem from './CredentialItem';
import EditCredentialModal from './EditCredentialModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import MasterKeyPrompt from './MasterKeyPrompt';

const categoryIcons = {
  email: Mail,
  developer: Code,
  cybersecurity: Shield,
  social: Users,
  freelance: Briefcase,
};

// New interface for decryption progress
interface DecryptionProgress {
  total: number;
  completed: number;
  failed: number;
  currentVault?: string;
  status: 'idle' | 'loading' | 'decrypting' | 'completed' | 'error';
  details: string[];
}

const VaultDashboard: React.FC = () => {
  const { user, masterKey, temporaryMasterKey, setTemporaryMasterKey, clearTemporaryMasterKey } = useAuth();
  const [vaults, setVaults] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMasterKeyPromptOpen, setIsMasterKeyPromptOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [deletingCredential, setDeletingCredential] = useState<Credential | null>(null);
  const [error, setError] = useState('');
  const [requiresMasterKey, setRequiresMasterKey] = useState(false);
  
  // Add refs to track state and prevent multiple calls
  const hasLoadedVaults = useRef(false);
  const isProcessingMasterKey = useRef(false);
  const hasShownMasterKeyPrompt = useRef(false);
  const validatedMasterKeyRef = useRef<string>(''); // Track validated master key

  // NEW: Decryption progress state
  const [decryptionProgress, setDecryptionProgress] = useState<DecryptionProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    status: 'idle',
    details: []
  });

  // FIXED: Get master key from memory (temporary first, then permanent)
  const getCurrentMasterKey = (): string => {
    return temporaryMasterKey || masterKey || ''; //validatedMasterKeyRef.current || 
  };

  // NEW: Update progress function
  const updateProgress = (updates: Partial<DecryptionProgress>) => {
    setDecryptionProgress(prev => ({
      ...prev,
      ...updates
    }));
  };

  // NEW: Add detail message (cleaned up for security)
  const addProgressDetail = (message: string) => {
    setDecryptionProgress(prev => ({
      ...prev,
      details: [...prev.details, message]
    }));
  };

  // FIXED: Improved loadVaults with better error handling
  const loadVaults = useCallback(async (masterKeyToUse?: string) => {
    // Prevent multiple simultaneous calls
    if (hasLoadedVaults.current && credentials.length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Reset progress
      updateProgress({
        total: 0,
        completed: 0,
        failed: 0,
        status: 'loading',
        details: ['Starting vault decryption process...']
      });

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use provided master key or get from memory
      const currentMasterKey = masterKeyToUse || getCurrentMasterKey();
      
      if (!currentMasterKey) {
        addProgressDetail('No master key available for decryption');
        if (!hasShownMasterKeyPrompt.current) {
          setRequiresMasterKey(true);
          setIsMasterKeyPromptOpen(true);
          hasShownMasterKeyPrompt.current = true;
        }
        setIsLoading(false);
        updateProgress({ status: 'idle' });
        return;
      }

      addProgressDetail('Fetching vault items...');

      const response = await apiService.getVaults();
      setVaults(response.vaults);

      updateProgress({
        total: response.vaults.length,
        status: 'decrypting',
        details: [`Found ${response.vaults.length} vault item(s) to decrypt`]
      });

      if (response.vaults.length === 0) {
        addProgressDetail('No vault items found - ready to add credentials');
        setCredentials([]);
        hasLoadedVaults.current = true;
        updateProgress({ status: 'completed' });
        return;
      }
      
      const decryptedCredentials: Credential[] = [];
      let successfulDecryptions = 0;
      let failedDecryptions = 0;
      
      addProgressDetail(`Starting decryption of ${response.vaults.length} vault item(s)...`);

      for (const vault of response.vaults) {
        try {
          updateProgress({ currentVault: `Vault ${vault.id.substring(0, 8)}...` });
          addProgressDetail(`Decrypting: ${vault.id.substring(0, 8)}...`);

          const vaultDetail = await apiService.getVaultItem(vault.id);

          const encryptedData = {
            data: vaultDetail.vault.encrypted_data,
            salt: vaultDetail.vault.encryption_salt,
            version: vaultDetail.vault.version || '1.0'
          };

          // Enhanced decryption with detailed error handling
          try {
            const decrypted = await CryptoService.decryptData(
              encryptedData, 
              currentMasterKey, 
              user.email
            );

            if (decrypted && decrypted.length > 0 && decrypted[0]) {
              const credential = {
                ...decrypted[0],
                id: vault.id,
                lastAccessed: vault.last_accessed_at,
                createdAt: vault.created_at
              };
              decryptedCredentials.push(credential);
              successfulDecryptions++;
              
              addProgressDetail(`Decrypted: ${credential.username || 'Unknown credential'}`);
              updateProgress({ 
                completed: successfulDecryptions,
                currentVault: undefined
              });
            } else {
              throw new Error('Decryption returned empty data');
            }
          } catch (decryptError) {
            throw new Error('Decryption failed');
          }

        } catch (error) {
          failedDecryptions++;
          const errorMsg = `Failed to decrypt vault ${vault.id.substring(0, 8)}`;
          addProgressDetail(errorMsg);
          updateProgress({ 
            failed: failedDecryptions,
            currentVault: undefined
          });
        }
      }
      
      setCredentials(decryptedCredentials);
      hasLoadedVaults.current = true;
      
      const summary = `Decryption completed: ${successfulDecryptions} successful, ${failedDecryptions} failed`;
      addProgressDetail(summary);
      updateProgress({ status: 'completed' });
      
      // FIXED: Better error handling for decryption failures
      if (successfulDecryptions === 0 && response.vaults.length > 0) {
        // All decryptions failed
        const errorMsg = `Unable to decrypt any credentials with the provided master key.`;
        
        setError(errorMsg);
        addProgressDetail('All decryptions failed');
        
        // Clear the invalid master key from memory
        clearTemporaryMasterKey();
        validatedMasterKeyRef.current = '';
        if (!hasShownMasterKeyPrompt.current) {
          setRequiresMasterKey(true);
          setIsMasterKeyPromptOpen(true);
          hasShownMasterKeyPrompt.current = true;
        }
      } else if (failedDecryptions > 0) {
        // Some decryptions failed
        setError(`Successfully decrypted ${successfulDecryptions} credentials, but ${failedDecryptions} could not be decrypted.`);
      } else if (successfulDecryptions > 0) {
        addProgressDetail('All credentials successfully decrypted and loaded!');
        setError(''); // Clear any previous errors
      }
      
    } catch (error) {
      const errorMsg = 'Failed to load credentials';
      setError(errorMsg);
      addProgressDetail(`Error: ${errorMsg}`);
      updateProgress({ status: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [user, masterKey, temporaryMasterKey, credentials.length, clearTemporaryMasterKey]);

  // FIXED: Enhanced useEffect with better prompt detection
  useEffect(() => {
    const checkAndLoadVaults = async () => {
      if (user && !hasLoadedVaults.current && !isProcessingMasterKey.current) {
        const currentMasterKey = getCurrentMasterKey();
        
        if (currentMasterKey) {
          // We have master key in memory, load vaults directly
          await loadVaults();
        } else {
          // No master key in memory, show prompt
          if (!hasShownMasterKeyPrompt.current) {
            setRequiresMasterKey(true);
            setIsMasterKeyPromptOpen(true);
            hasShownMasterKeyPrompt.current = true;
          }
        }
      }
    };

    checkAndLoadVaults();
  }, [user, loadVaults]);
  

  // FIXED: Enhanced master key validation
  const handleMasterKeySubmit = async (enteredMasterKey: string) => {
    if (isProcessingMasterKey.current) return;
    
    isProcessingMasterKey.current = true;
    try {
      addProgressDetail('Validating master key...');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      let masterKeyValid = false;
      
      // Get fresh vault list for validation
      const vaultsResponse = await apiService.getVaults();
      
      if (vaultsResponse.vaults.length > 0) {
        // Test with the first vault item
        const validationVaultId = vaultsResponse.vaults[0].id;
        addProgressDetail(`Testing master key...`);
        
        try {
          const vaultDetail = await apiService.getVaultItem(validationVaultId);
          const encryptedData = {
            data: vaultDetail.vault.encrypted_data,
            salt: vaultDetail.vault.encryption_salt,
            version: vaultDetail.vault.version || '1.0'
          };
          
          // Test decryption
          const decrypted = await CryptoService.decryptData(encryptedData, enteredMasterKey, user.email);
          
          if (decrypted && decrypted.length > 0 && decrypted[0]) {
            masterKeyValid = true;
            addProgressDetail('Master key validated successfully');
          } else {
            throw new Error('Decryption returned empty data');
          }
        } catch (validationError) {
          addProgressDetail('Master key validation failed');
          throw new Error('This master key cannot decrypt your vault data.');
        }
      } else {
        // No vaults exist - accept any master key for new users
        addProgressDetail('No existing vaults - accepting master key');
        masterKeyValid = true;
      }
      
      if (masterKeyValid) {
        // Store the validated master key
        addProgressDetail('Storing master key...');
        setTemporaryMasterKey(enteredMasterKey);
        validatedMasterKeyRef.current = enteredMasterKey; // Store for immediate use
        
        setIsMasterKeyPromptOpen(false);
        setRequiresMasterKey(false);
        setError(''); // Clear any previous errors
        hasLoadedVaults.current = false;
        hasShownMasterKeyPrompt.current = true;
        
        // Use the exact same master key for loading vaults
        addProgressDetail('Loading vaults...');
        await loadVaults(enteredMasterKey);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid master key. Please try again.';
      throw new Error(errorMessage);
    } finally {
      isProcessingMasterKey.current = false;
    }
  };

  // FIXED: Enhanced cancel handler - reset prompt tracking
  const handleMasterKeyCancel = () => {
    setIsMasterKeyPromptOpen(false);
    setRequiresMasterKey(false);
    
    // Reset the prompt tracking so it can show again if needed
    hasShownMasterKeyPrompt.current = false;
    
    if (!getCurrentMasterKey()) {
      setCredentials([]);
      setVaults([]);
    }
  };

  // FIXED: Enhanced add credential handler with prompt retry
  const handleAddCredential = () => {
    const currentMasterKey = getCurrentMasterKey();
    
    if (!currentMasterKey) {
      // Reset prompt tracking to allow showing prompt again
      hasShownMasterKeyPrompt.current = false;
      setRequiresMasterKey(true);
      setIsMasterKeyPromptOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  // FIXED: Enhanced edit credential handler with prompt retry
  const handleEditCredential = (credential: Credential) => {
    if (!getCurrentMasterKey()) {
      // Reset prompt tracking to allow showing prompt again
      hasShownMasterKeyPrompt.current = false;
      setRequiresMasterKey(true);
      setIsMasterKeyPromptOpen(true);
      return;
    }
    setEditingCredential(credential);
    setIsEditModalOpen(true);
  };

  // Rest of your functions remain the same...
  const handleCredentialAdded = () => {
    hasLoadedVaults.current = false;
    loadVaults();
  };

  const handleDeleteCredential = (credential: Credential) => {
    setDeletingCredential(credential);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingCredential?.id) {
      try {
        await apiService.deleteVaultItem(deletingCredential.id);
        hasLoadedVaults.current = false;
        loadVaults();
      } catch (error) {
        setError('Failed to delete credential. Please try again.');
      }
    }
    setIsDeleteModalOpen(false);
    setDeletingCredential(null);
  };

  const handleUpdateCredential = () => {
    setIsEditModalOpen(false);
    setEditingCredential(null);
    hasLoadedVaults.current = false;
    loadVaults();
  };

  const handleReenterMasterKey = () => {
    clearTemporaryMasterKey();
    validatedMasterKeyRef.current = '';
    setCredentials([]);
    setVaults([]);
    hasLoadedVaults.current = false;
    hasShownMasterKeyPrompt.current = false;
    setRequiresMasterKey(true);
    setIsMasterKeyPromptOpen(true);
  };

  const filteredCredentials = credentials.filter(credential => {
    const matchesSearch = credential.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credential.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credential.url?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || credential.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'email', name: 'Email Accounts', count: credentials.filter(v => v.category === 'email').length },
    { id: 'developer', name: 'Developer Platforms', count: credentials.filter(v => v.category === 'developer').length },
    { id: 'cybersecurity', name: 'Cybersecurity', count: credentials.filter(v => v.category === 'cybersecurity').length },
    { id: 'social', name: 'Social Accounts', count: credentials.filter(v => v.category === 'social').length },
    { id: 'freelance', name: 'Freelance Platforms', count: credentials.filter(v => v.category === 'freelance').length },
  ];

  // Enhanced loading component with progress (cleaned up)
  if (isLoading && credentials.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-full">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Unlocking Your Vault</h2>
              <p className="text-gray-600">Securely decrypting your credentials</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: decryptionProgress.total > 0 
                    ? `${(decryptionProgress.completed / decryptionProgress.total) * 100}%` 
                    : '0%' 
                }}
              ></div>
            </div>
          </div>

          {/* Current Activity */}
          {decryptionProgress.currentVault && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-sm text-yellow-800 font-medium">Processing vault...</span>
              </div>
            </div>
          )}

          {/* Cleaned up log */}
          {/* <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Progress Log</h4>
            <div className="space-y-2">
              {decryptionProgress.details.slice(-8).map((detail, index) => (
                <div key={index} className="text-xs text-gray-600">
                  {detail}
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    );
  }

  if (requiresMasterKey && isMasterKeyPromptOpen) {
    return (
      <MasterKeyPrompt
        isOpen={isMasterKeyPromptOpen}
        onSubmit={handleMasterKeySubmit}
        onCancel={handleMasterKeyCancel}
      />
    );
  }

   return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Security Status Bar */}
      {!error && (
        <div className={`${decryptionProgress.status === 'decrypting' ? 'sticky top-4 z-50 transition-all duration-500 ease-in-out shadow-sm' : 'mb-6 transition-all duration-500 ease-in-out'} p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getCurrentMasterKey() ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Lock className={`h-5 w-5 ${getCurrentMasterKey() ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <div>
              <h3 className="text-sm font-medium">
                {getCurrentMasterKey() ? 'Vault Unlocked' : 'Vault Locked'}
              </h3>
              <p className="text-sm text-gray-600">
                {getCurrentMasterKey() 
                  ? 'Your credentials are decrypted and secure in memory'
                  : 'Enter master key to access credentials'
                }
              </p>
            </div>
          </div>
          {decryptionProgress.currentVault && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-sm text-yellow-800 font-medium">Processing vault...</span>
            </div>
          )}
        </div>
      )}

      {/* Rest of your JSX remains the same */}
      {/* Header */}
      <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Vault</h1>
          <p className="text-gray-600">
            {credentials.length} {credentials.length === 1 ? 'credential' : 'credentials'} secured
          </p>
          {error && (
            <div className="mt-2">
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
              {getCurrentMasterKey() && (
                <button
                  onClick={handleReenterMasterKey}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Re-enter Master Key
                </button>
              )}
            </div>
          )}
        </div>

      {/* Search and Add */}
      <div className="mb-6 flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <button 
          onClick={handleAddCredential}
          disabled={!getCurrentMasterKey()}
          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Credential
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({credentials.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>


      {/* Credentials List */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Credentials` : 'All Credentials'}
          <span className="text-sm text-gray-500 ml-2">({filteredCredentials.length})</span>
        </h2>
        {filteredCredentials.length === 0 ? (
          <div className="text-center py-12">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory ? 'Try adjusting your search or filter' : 'Get started by adding your first credential'}
            </p>
            {!searchTerm && !selectedCategory && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Credential
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCredentials.map((credential) => (
              <CredentialItem
                key={credential.id}
                credential={credential}
                onEdit={handleEditCredential}
                onDelete={handleDeleteCredential}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCredentialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCredentialAdded={handleCredentialAdded}
        masterKey={getCurrentMasterKey()}
      />

      {editingCredential && (
        <EditCredentialModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCredential(null);
          }}
          credential={editingCredential}
          onCredentialUpdated={handleUpdateCredential}
          masterKey={getCurrentMasterKey()}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCredential(null);
        }}
        onConfirm={confirmDelete}
        credential={deletingCredential}
      />

      <MasterKeyPrompt
        isOpen={isMasterKeyPromptOpen}
        onSubmit={handleMasterKeySubmit}
        onCancel={handleMasterKeyCancel}
      />
    </div>
  );
};

export default VaultDashboard;  