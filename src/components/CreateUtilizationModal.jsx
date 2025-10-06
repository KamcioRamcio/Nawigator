import React, { useState, useEffect } from 'react';
import apiUrl from '../constants/api';
import toastService from '../utils/toast';

function CreateUtilizationModal({ isOpen, onClose, onUtilizationCreated }) {
    const [utilizationName, setUtilizationName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setUtilizationName('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!utilizationName.trim()) {
            toastService.warning('Wprowadź nazwę utylizacji');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                nazwa: utilizationName,
                status: "Nowa",
                data_utylizacji: new Date().toLocaleDateString("pl-PL"),
                kto_utworzyl: localStorage.getItem("username") || ""
            };

            const response = await fetch(`${apiUrl}utylizacja`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Nie udało się utworzyć utylizacji');
            }

            const data = await response.json();
            toastService.success('Utylizacja utworzona pomyślnie');
            onClose();

            if (onUtilizationCreated) {
                onUtilizationCreated(data);
            }
        } catch (error) {
            console.error('Error creating utilization:', error);
            toastService.error('Błąd podczas tworzenia utylizacji');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
                    <h2 className="text-xl font-semibold">Utwórz nową utylizację</h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nazwa utylizacji <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={utilizationName}
                            onChange={(e) => setUtilizationName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Wprowadź nazwę utylizacji"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <span className="animate-spin mr-2">⏳</span>
                                    Tworzenie...
                                </span>
                            ) : 'Utwórz utylizację'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateUtilizationModal;