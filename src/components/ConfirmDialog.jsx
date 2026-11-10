import React from 'react';

function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 id="confirm-title" className="text-xl font-bold mb-4">Potwierdzenie</h3>
                <p className="mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-sm"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-sm"
                    >
                        Potwierdź
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;