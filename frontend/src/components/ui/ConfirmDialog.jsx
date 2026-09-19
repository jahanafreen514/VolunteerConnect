import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // 'danger' | 'warning'
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
      onClose();
    }
  };

  const isDanger = variant === 'danger';
  const Icon = isDanger ? Trash2 : AlertTriangle;
  const iconBg = isDanger ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="Confirm Action">
      <div className="flex flex-col items-center text-center pt-4 pb-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBg}`}>
          <Icon className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-8">{message}</p>
        
        <div className="w-full flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            className="flex-1"
            onClick={handleConfirm}
            loading={isConfirming}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
