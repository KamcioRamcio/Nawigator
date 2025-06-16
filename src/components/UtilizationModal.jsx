import React, {useState} from 'react';
import axios from 'axios';
import apiUrl from "../constants/api.js";


const UtilizationModal = ({isOpen, onClose, medicine, onUtilizationComplete}) => {
    const [formData, setFormData] = useState({
        grupa: '',
        ilosc_nominalna: '',
        powod_utylizacji: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const utilizationData = {
                nazwa: medicine.lek_nazwa,
                ilosc: medicine.lek_ilosc,
                opakowanie: medicine.lek_opakowanie,
                data_waznosci: medicine.lek_data,
                ilosc_nominalna: formData.ilosc_nominalna,
                grupa: formData.grupa,
                powod_utylizacji: formData.powod_utylizacji
            };

            await axios.post(apiUrl + `utylizacja/from-medicine`, utilizationData);

            setIsSubmitting(false);
            onClose();

            if (onUtilizationComplete) {
                onUtilizationComplete();
            }
        } catch (err) {
            setIsSubmitting(false);
            setError(err.response?.data?.message || 'Wystąpił błąd podczas utylizacji');
            console.error('Utilization error:', err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 rounded-t-xl border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-red-100 p-2 rounded-lg">
                                <span className="text-xl">🗑️</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Utylizacja Leku</h2>
                                <p className="text-sm text-gray-600">{medicine.lek_nazwa}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 p-1 rounded-full"
                            disabled={isSubmitting}
                        >
                            <span className="text-xl">✕</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    {/* Medicine Info Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="text-sm font-medium text-blue-900 mb-2">Informacje o leku</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-blue-700 font-medium">Ilość:</span>
                                <p className="text-blue-900">{medicine.lek_ilosc}</p>
                            </div>
                            <div>
                                <span className="text-blue-700 font-medium">Data ważności:</span>
                                <p className="text-blue-900">{medicine.lek_data}</p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <span>⚠️</span>
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Group Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grupa <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="grupa"
                                value={formData.grupa}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                required
                            >
                                <option value="">Wybierz grupę</option>
                                <option value="S">Sprzęt</option>
                                <option value="L">Lek</option>
                                <option value="Other">Inna</option>
                            </select>
                        </div>

                        {/* Nominal Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ilość nominalna <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="ilosc_nominalna"
                                value={formData.ilosc_nominalna}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Wprowadź ilość nominalną"
                                required
                            />
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Powód utylizacji <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="powod_utylizacji"
                                value={formData.powod_utylizacji}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                rows="3"
                                placeholder="Opisz powód utylizacji..."
                                required
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium bg-white"
                                disabled={isSubmitting}
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center space-x-2">
                                    <span className="animate-spin">⏳</span>
                                    <span>Przetwarzanie...</span>
                                </span>
                                ) : (
                                    <span className="flex items-center justify-center space-x-2">
                                    <span>🗑️</span>
                                    <span>Utylizuj</span>
                                </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UtilizationModal;
