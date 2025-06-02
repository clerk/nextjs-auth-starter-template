// components/ConfirmModal.tsx
import React from 'react';
import { Dialog } from '@headlessui/react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: Props) => (
  <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
    <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
    <div className="relative bg-white p-6 rounded-xl shadow-xl w-full max-w-sm z-50">
      <Dialog.Title className="text-lg font-bold mb-2">{title || 'Confirm'}</Dialog.Title>
      <Dialog.Description className="text-sm text-gray-700 mb-4">
        {message || 'Are you sure you want to proceed?'}
      </Dialog.Description>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </Dialog>
);

export default ConfirmModal;
