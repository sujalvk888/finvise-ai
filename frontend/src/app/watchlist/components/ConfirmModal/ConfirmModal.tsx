import React from 'react';
import styles from './ConfirmModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {cancelText}
          </button>
          <button className={styles.confirmBtn} onClick={() => {
            onConfirm();
            onClose();
          }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
