import React from 'react';
import Button from '../Button/Button';
import { X } from 'lucide-react';

interface CenteredModalProps {
  isOpen: boolean; 
  onClose?: () => void;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  BtnVariants: 'primary' | 'secondary' | 'danger';
}

const CenteredModal: React.FC<CenteredModalProps> = ({ 
  isOpen,
  onClose,
  message, 
  buttonText, 
  onButtonClick,
  BtnVariants
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-lg p-8 max-w-md w-full shadow-xl transform transition-all">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X size={20} />
          </button>
        )}

        <p className="text-gray-700 text-lg mb-6 text-center">{message}</p>
        
        <div className="flex justify-center gap-4">
          <Button
            variant={BtnVariants}
            onClick={onButtonClick}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CenteredModal;
