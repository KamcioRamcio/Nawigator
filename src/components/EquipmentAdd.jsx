import React from 'react';

function EquipmentAdd({isOpen, onClose, children}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center text-sm">
            <div className="bg-white p-6 rounded shadow-lg">
                <button onClick={onClose} className="absolute top-1/4 right-[4px] bg-slate-900 text-white font-semibold rounded-3xl p-4">Zamknij</button>
                {children}
            </div>
        </div>
    );
}

export default EquipmentAdd;