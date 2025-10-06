import React, { useState, useEffect } from 'react';
import apiUrl from '../constants/api';
import toastService from '../utils/toast';

function AddItemToUtilizationModal({ isOpen, onClose, onItemAdded }) {
    const [utilizations, setUtilizations] = useState([]);
    const [selectedUtilization, setSelectedUtilization] = useState('');
    const [itemType, setItemType] = useState('medicine');
    const [formData, setFormData] = useState({
        nazwa: '',
        ilosc: '',
        data_waznosci: '',
        opakowanie: '',
        powod_utylizacji: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUtilizations();
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setSelectedUtilization('');
        setItemType('medicine');
        setFormData({
            nazwa: '',
            ilosc: '',
            data_waznosci: '',
            opakowanie: '',
            powod_utylizacji: ''
        });
        setIsSubmitting(false);
    };

    const fetchUtilizations = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}utylizacja`);
            if (!response.ok) {
                throw new Error('Failed to fetch utilizations');
            }
            const data = await response.json();
            const activeUtilizations = data.filter(utilization =>
                utilization.status?.toLowerCase() !== "zakończone" &&
                utilization.status?.toLowerCase() !== "anulowane"
            );
            setUtilizations(activeUtilizations);
        } catch (error) {
            console.error('Error fetching utilizations:', error);
            toastService.error('Błąd podczas pobierania utylizacji');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedUtilization) {
            toastService.warning('Wybierz utylizację');
            return;
        }

        if (!formData.nazwa.trim() || !formData.ilosc) {
            toastService.warning('Wprowadź nazwę i ilość');
            return;
        }

        setIsSubmitting(true);

        try {
            let endpoint;
            let payload;

            if (itemType === 'medicine') {
                endpoint = `${apiUrl}utylizacja/lek`;
                payload = {
                    id_utylizacji: selectedUtilization,
                    nazwa: formData.nazwa,
                    ilosc: formData.ilosc,
                    opakowanie: formData.opakowanie,
                    data_waznosci: formData.data_waznosci,
                    powod_utylizacji: formData.powod_utylizacji || 'brak'
                };
            } else {
                endpoint = `${apiUrl}utylizacja/sprzet`;
                payload = {
                    id_utylizacji: selectedUtilization,
                    nazwa: formData.nazwa,
                    ilosc: formData.ilosc,
                    data_waznosci: formData.data_waznosci,
                    powod_utylizacji: formData.powod_utylizacji || 'brak'
                };
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Nie udało się dodać pozycji do utylizacji');
            }

            toastService.success('Pozycja dodana do utylizacji');
            onClose();

            if (onItemAdded) {
                onItemAdded();
            }
        } catch (error) {
            console.error('Error adding item to utilization:', error);
            toastService.error('Błąd podczas dodawania pozycji do utylizacji');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                {/* Header */}
                <div className="bg-purple-600 text-white p-4 rounded-t-lg">
                    <h2 className="text-xl font-semibold">Dodaj pozycję do utylizacji</h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Utilization Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Wybierz utylizację <span className="text-red-500">*</span>
                        </label>
                        {loading ? (
                            <div className="text-center py-2">Ładowanie utylizacji...</div>
                        ) : (
                            <select
                                value={selectedUtilization}
                                onChange={(e) => setSelectedUtilization(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            >
                                <option value="">Wybierz utylizację</option>
                                {utilizations.map(utilization => (
                                    <option key={utilization.id} value={utilization.id}>
                                        {utilization.nazwa} ({utilization.status || "Nowa"})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Item Type Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Typ pozycji <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="itemType"
                                    value="medicine"
                                    checked={itemType === 'medicine'}
                                    onChange={() => setItemType('medicine')}
                                    className="mr-2"
                                />
                                <span>Lek</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="itemType"
                                    value="equipment"
                                    checked={itemType === 'equipment'}
                                    onChange={() => setItemType('equipment')}
                                    className="mr-2"
                                />
                                <span>Sprzęt</span>
                            </label>
                        </div>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nazwa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nazwa"
                                value={formData.nazwa}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Wprowadź nazwę pozycji"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ilość <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="ilosc"
                                value={formData.ilosc}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Wprowadź ilość"
                                min="0.1"
                                step="0.1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data ważności
                            </label>
                            <input
                                type="date"
                                name="data_waznosci"
                                value={formData.data_waznosci}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {itemType === 'medicine' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Opakowanie
                                </label>
                                <input
                                    type="text"
                                    name="opakowanie"
                                    value={formData.opakowanie}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Wprowadź opakowanie"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Powód utylizacji
                            </label>
                            <textarea
                                name="powod_utylizacji"
                                value={formData.powod_utylizacji}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                placeholder="Wprowadź powód utylizacji"
                                rows="3"
                            />
                        </div>
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
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <span className="animate-spin mr-2">⏳</span>
                                    Dodawanie...
                                </span>
                            ) : 'Dodaj pozycję'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddItemToUtilizationModal;