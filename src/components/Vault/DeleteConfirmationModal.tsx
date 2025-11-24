import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Credential } from '../../utils/crypto/encryption';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  credential: Credential | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  credential
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !credential) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Delete Credential</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete this credential? This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">{credential.username}</span>
              </div>
              {credential.url && (
                <p className="text-sm text-red-700 mt-1">{credential.url}</p>
              )}
              <p className="text-xs text-red-600 mt-2">
                Category: <span className="capitalize">{credential.category}</span>
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="font-medium text-yellow-800 mb-1">Warning</p>
            <p>This will permanently delete the credential from your vault. You will lose access to this login information.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;