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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-card rounded-lg p-8 max-w-md w-full shadow-card transform transition-all">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <X size={20} />
          </button>
        )}

        <p className="text-foreground text-lg mb-6 text-center">{message}</p>
        
        <div className="flex justify-center gap-4">
          <Button
            variant={BtnVariants}
            onClick={onButtonClick}
            className="px-6 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CenteredModal;